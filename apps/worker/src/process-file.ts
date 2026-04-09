import { createResponse } from "./utils";
import { and, eq, sql } from "@curiositi/db";
import db from "@curiositi/db/client";
import { fileContents, files } from "@curiositi/db/schema";
import read from "@curiositi/share/fs/read";
import type { Logger } from "./create-logger";
import { chunkPages } from "./lib/chunk";
import { embedChunks } from "@curiositi/share/ai";
import { env } from "./env";
import { getProcessor } from "./processors";
import { captureWorkerException } from "./sentry";
import { isCsvMimeType, extractCsvHeaders } from "./lib/file-type-utils";

type ProcessFileProps = {
	fileId: string;
	orgId: string;
	logger: Logger;
	requestId?: string;
	jobId?: string;
	route?: string;
};

export default async function processFile({
	fileId,
	orgId,
	logger,
	requestId,
	jobId,
	route,
}: ProcessFileProps) {
	logger.info("Starting file processing", { fileId, orgId });

	try {
		logger.debug("Claiming file for processing", { fileId, orgId });
		const claimedFile = await db
			.update(files)
			.set({ status: "processing", processedAt: null })
			.where(
				and(
					eq(files.id, fileId),
					eq(files.organizationId, orgId),
					sql`${files.status} in ('pending', 'failed')`
				)
			)
			.returning();

		if (!claimedFile[0]) {
			logger.debug("File could not be claimed, checking current status", {
				fileId,
				orgId,
			});
			const fileData = await db
				.select()
				.from(files)
				.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));

			if (!fileData[0]) {
				logger.error("File not found in database", { fileId, orgId });
				return createResponse(null, "File not found");
			}

			if (fileData[0].status === "processing") {
				logger.info(
					"Retry-safe duplicate delivery ignored while file is processing",
					{
						fileId,
						orgId,
					}
				);
				return createResponse(null, "File is already being processed");
			}

			if (fileData[0].status === "completed") {
				logger.info(
					"Retry-safe duplicate delivery ignored for completed file",
					{
						fileId,
						orgId,
					}
				);
				return createResponse(null, "File is already processed");
			}

			logger.error("File not found in database", { fileId, orgId });
			return createResponse(null, "File not found");
		}

		logger.info("File data fetched successfully", {
			fileId,
			path: claimedFile[0].path,
		});
		logger.info("File claimed for retry-safe processing", { fileId, orgId });

		// Read file from storage
		logger.debug("Reading file from storage", {
			path: claimedFile[0].path,
		});
		let file: Awaited<ReturnType<typeof read>>;
		try {
			file = await read(claimedFile[0].path, {
				accessKeyId: env.S3_ACCESS_KEY_ID,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY,
				bucket: env.S3_BUCKET,
				endpoint: env.S3_ENDPOINT,
			});
			logger.info("File read successfully from storage", {
				path: claimedFile[0].path,
			});
		} catch (readError) {
			logger.error("Failed to read file from storage", {
				path: claimedFile[0].path,
				error: readError,
			});
			throw readError;
		}

		const filetype = claimedFile[0].type;
		const fileName = claimedFile[0].name;
		const processor = getProcessor(filetype);

		if (!processor) {
			logger.error("Unsupported file type", { fileId, filetype });
			throw new Error(`Unsupported file type: ${filetype}`);
		}

		logger.debug("Processing file content", { fileId, filetype });
		const pages = await processor({
			file,
			fileData: claimedFile[0],
			fileId,
			logger,
		});
		logger.info("File content processed successfully", {
			fileId,
			pageCount: pages.length,
		});

		const documentTitle = pages[0]?.metadata?.title;
		const csvHeaders = isCsvMimeType(filetype)
			? extractCsvHeaders(pages[0]?.content ?? "")
			: undefined;

		logger.debug("Chunking pages", {
			fileId,
			pageCount: pages.length,
		});
		let chunks: Awaited<ReturnType<typeof chunkPages>>;
		try {
			chunks = chunkPages(pages, {
				fileName,
				fileType: filetype,
				documentTitle,
				csvHeaders,
			});
			logger.info("Pages chunked successfully", {
				fileId,
				chunkCount: chunks.length,
			});
		} catch (chunkError) {
			logger.error("Failed to chunk pages", {
				fileId,
				error: chunkError,
			});
			throw chunkError;
		}

		// Generate embeddings
		logger.debug("Generating embeddings for chunks", {
			fileId,
			chunkCount: chunks.length,
		});
		let embeddings: number[][];
		try {
			const embeddingResult = await embedChunks({
				chunks: chunks.map((c) => c.embeddedText),
				provider: "openai",
			});
			embeddings = embeddingResult.embeddings;
			logger.info("Embeddings generated successfully", {
				fileId,
				embeddingCount: embeddings.length,
			});
		} catch (embedError) {
			logger.error("Failed to generate embeddings", {
				fileId,
				error: embedError,
			});
			throw embedError;
		}

		logger.debug("Replacing derived file content in database", {
			fileId,
			chunkCount: chunks.length,
		});
		let res: (typeof fileContents.$inferSelect)[];
		try {
			res = await db.transaction(async (tx) => {
				await tx.delete(fileContents).where(eq(fileContents.fileId, fileId));
				logger.info("Cleared prior derived content before insert", { fileId });

				const insertedChunks = await tx
					.insert(fileContents)
					.values(
						chunks.map((c, idx) => ({
							fileId,
							content: c.content,
							embeddedContent: embeddings[idx] as number[],
							metadata: {
								page_number: c.pageNumbers ?? c.pageNumber,
								file_name: fileName,
								file_type: filetype,
							},
						}))
					)
					.returning();

				await tx
					.update(files)
					.set({ status: "completed", processedAt: new Date() })
					.where(eq(files.id, fileId));

				return insertedChunks;
			});

			logger.info("Derived file content replaced successfully", {
				fileId,
				insertedCount: res.length,
			});
		} catch (insertError) {
			logger.error("Failed to insert chunks into database", {
				fileId,
				error: insertError,
			});
			throw insertError;
		}

		logger.info("File processing completed successfully", { fileId });

		return createResponse(res, null);
	} catch (error) {
		logger.error("File processing failed", { fileId, orgId, error });
		captureWorkerException(error, {
			operation: "process-file",
			route,
			requestId,
			jobId,
			fileId,
			orgId,
			extra: {
				status: "failed",
			},
		});

		// Update file status to failed
		try {
			await db
				.update(files)
				.set({ status: "failed" })
				.where(eq(files.id, fileId));
			logger.info("File status updated to failed", { fileId });
		} catch (updateError) {
			logger.error("Failed to update file status to failed", {
				fileId,
				error: updateError,
			});
		}

		return createResponse(
			null,
			error instanceof Error ? error.message : "An unexpected error occurred"
		);
	}
}
