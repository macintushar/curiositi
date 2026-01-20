import { createResponse } from "./utils";
import { and, eq } from "@curiositi/db";
import db from "@curiositi/db/client";
import { fileContents, files } from "@curiositi/db/schema";
import read from "@curiositi/share/fs/read";
import parsePdf, { type PdfParseResult } from "./lib/md";
import type { Logger } from "./create-logger";
import { chunkPages } from "./lib/chunk";
import { embedChunks } from "./lib/ai";
import { env } from "./env";
import { TEXT_FILE_TYPES } from "@curiositi/share/constants";

type ProcessFileProps = {
	fileId: string;
	orgId: string;
	logger: Logger;
};

function isTextMimeType(mimeType: string): boolean {
	return TEXT_FILE_TYPES.includes(mimeType) || mimeType.startsWith("text/");
}

export default async function processFile({
	fileId,
	orgId,
	logger,
}: ProcessFileProps) {
	logger.info("Starting file processing", { fileId, orgId });

	try {
		// Fetch file data from database
		logger.debug("Fetching file data from database", { fileId, orgId });
		const fileData = await db
			.select()
			.from(files)
			.where(and(eq(files.id, fileId), eq(files.organizationId, orgId)));

		if (!fileData[0]) {
			logger.error("File not found in database", { fileId, orgId });
			return createResponse(null, "File not found");
		}

		if (fileData[0].status === "processing") {
			logger.error("File is already being processed", { fileId });
			return createResponse(null, "File is already being processed");
		}

		if (fileData[0].status === "completed") {
			logger.error("File is already processed", { fileId });
			return createResponse(null, "File is already processed");
		}

		logger.info("File data fetched successfully", {
			fileId,
			path: fileData[0].path,
		});

		// Update file status to processing
		logger.debug("Updating file status to processing", { fileId });
		await db
			.update(files)
			.set({ status: "processing" })
			.where(eq(files.id, fileId));
		logger.info("File status updated to processing", { fileId });

		// Read file from storage
		logger.debug("Reading file from storage", {
			path: fileData[0].path,
		});
		let file: Awaited<ReturnType<typeof read>>;
		try {
			file = await read(fileData[0].path, {
				accessKeyId: env.S3_ACCESS_KEY_ID,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY,
				bucket: env.S3_BUCKET,
				endpoint: env.S3_ENDPOINT,
			});
			logger.info("File read successfully from storage", {
				path: fileData[0].path,
			});
		} catch (readError) {
			logger.error("Failed to read file from storage", {
				path: fileData[0].path,
				error: readError,
			});
			throw readError;
		}

		// Parse file to pages based on file type
		const filetype = fileData[0].type;
		let md: PdfParseResult;

		if (isTextMimeType(filetype)) {
			// Text-based files: read content directly as a single page
			logger.debug("Processing text-based file", { fileId, filetype });
			try {
				const textContent = await file.text();
				md = {
					metadata: {},
					pages: [{ pageNumber: 1, content: textContent }],
				};
				logger.info("Text file processed successfully", {
					fileId,
					contentLength: textContent.length,
				});
			} catch (textError) {
				logger.error("Failed to read text file", {
					fileId,
					error: textError,
				});
				throw textError;
			}
		} else {
			// PDF files: use the PDF parser
			logger.debug("Parsing PDF to markdown", { fileId });
			try {
				md = await parsePdf(file);
				logger.info("PDF parsed successfully", {
					fileId,
					pageCount: md.pages?.length,
				});
			} catch (parseError) {
				logger.error("Failed to parse PDF", {
					fileId,
					error: parseError,
				});
				throw parseError;
			}
		}

		// Chunk pages
		logger.debug("Chunking pages", {
			fileId,
			pageCount: md.pages?.length,
		});
		let chunks: Awaited<ReturnType<typeof chunkPages>>;
		try {
			chunks = chunkPages(md.pages);
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
				chunks: chunks.map((c) => c.content),
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

		// Insert chunks into database
		logger.debug("Inserting chunks into database", {
			fileId,
			chunkCount: chunks.length,
		});
		let res: (typeof fileContents.$inferSelect)[][];
		try {
			res = await Promise.all(
				chunks.map(async (c, idx) => {
					logger.debug("Inserting chunk", { fileId, chunkIndex: idx });
					const insertRes = await db
						.insert(fileContents)
						.values({
							fileId: fileId,
							content: c.content,
							embeddedContent: embeddings[idx] as number[],
							metadata: { page_number: c.pageNumbers ?? c.pageNumber },
						})
						.returning();
					return insertRes;
				})
			);
			logger.info("All chunks inserted successfully", {
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

		// Update file status to completed
		logger.debug("Updating file status to completed", { fileId });
		await db
			.update(files)
			.set({ status: "completed", processedAt: new Date() })
			.where(eq(files.id, fileId));
		logger.info("File processing completed successfully", { fileId });

		return createResponse(res, null);
	} catch (error) {
		logger.error("File processing failed", { fileId, orgId, error });

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
