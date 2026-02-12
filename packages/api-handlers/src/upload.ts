import client from "@curiositi/db/client";
import { eq } from "@curiositi/db";
import { files, filesInSpace } from "@curiositi/db/schema";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@curiositi/share/constants";
import write, {
	isS3UploadError,
	deleteS3Object,
} from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";
import type { S3Config } from "@curiositi/share/types";
import { createResponse } from "./response";

export type UploadHandlerInput = {
	file: File;
	orgId: string;
	userId: string;
	spaceId?: string;
	tags?: string[];
	s3: S3Config;
};

type UploadError = {
	validation: {
		error: string | null;
	};
	s3: {
		error: unknown | null;
	};
	db: {
		error: unknown | null;
	};
};

export default async function handleUpload({
	file,
	orgId,
	userId,
	spaceId,
	tags,
	s3,
}: UploadHandlerInput) {
	logger.info(`Attempting to Uploading File: ${file.name}`);

	const uploadError: UploadError = {
		validation: {
			error: null,
		},
		s3: {
			error: null,
		},
		db: {
			error: null,
		},
	};

	if (file.size > MAX_FILE_SIZE) {
		uploadError.validation.error = `File size exceeds the limit of ${
			MAX_FILE_SIZE / 1024 / 1024
		}MB`;
		return createResponse(null, uploadError);
	}

	const mimeType = file.type.split(";")[0] ?? "";
	if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
		uploadError.validation.error = `File type ${file.type} is not allowed`;
		return createResponse(null, uploadError);
	}

	const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

	let insertedFileId: string | null = null;

	try {
		const fileRecord = await client.transaction(async (tx) => {
			const insertedFile = await tx
				.insert(files)
				.values({
					name: file.name,
					path: "",
					type: file.type,
					size: file.size,
					organizationId: orgId,
					uploadedById: userId,
					status: "pending",
					tags: { tags: tags ?? [] },
				})
				.returning();

			if (!insertedFile[0]) {
				throw new Error("Failed to insert file record");
			}

			return insertedFile[0];
		});

		insertedFileId = fileRecord.id;

		logger.info(`[FILES] File record created in DB: ${file.name}`, {
			file: file.name,
			fileId: insertedFileId,
		});

		const path = `/curiositi/storage/${orgId}/${insertedFileId}-${sanitizedFileName}`;

		await write(path, file, {
			accessKeyId: s3.accessKeyId,
			secretAccessKey: s3.secretAccessKey,
			bucket: s3.bucket,
			endpoint: s3.endpoint,
		});

		logger.info(`File Uploaded to S3: ${file.name}`, {
			file: file.name,
			path: path,
			size: file.size,
		});

		const updatedFile = await client.transaction(async (tx) => {
			const updated = await tx
				.update(files)
				.set({ path })
				.where(eq(files.id, insertedFileId as string))
				.returning();

			if (!updated[0]) {
				throw new Error("Failed to update file with path and status");
			}

			if (spaceId) {
				await tx.insert(filesInSpace).values({
					fileId: insertedFileId as string,
					spaceId: spaceId,
				});

				logger.info(`[FILES <=> SPACES] File Added to Space: ${file.name}`, {
					file: file.name,
					path: path,
					size: file.size,
				});
			}

			return updated[0];
		});

		logger.info(`[FILES] File upload completed: ${file.name}`, {
			file: file.name,
			size: file.size,
		});

		return createResponse(updatedFile, null);
	} catch (error) {
		logger.error(`File Upload Failed: ${file.name}`, error);

		if (isS3UploadError(error)) {
			uploadError.s3.error = error;

			if (insertedFileId) {
				try {
					await client.delete(files).where(eq(files.id, insertedFileId));
					logger.info(
						`[FILES] Rolled back file record after S3 failure: ${file.name}`
					);
				} catch (rollbackError) {
					logger.error(
						`[FILES] Failed to rollback file record after S3 failure: ${file.name}`,
						rollbackError
					);
				}
			}
		} else {
			uploadError.db.error = error;

			const s3Path = insertedFileId
				? `/curiositi/storage/${orgId}/${insertedFileId}-${sanitizedFileName}`
				: null;
			if (s3Path) {
				await deleteS3Object(s3Path, {
					accessKeyId: s3.accessKeyId,
					secretAccessKey: s3.secretAccessKey,
					bucket: s3.bucket,
					endpoint: s3.endpoint,
				});
				logger.info(
					`[FILES] Cleaned up orphaned S3 object after DB failure: ${file.name}`
				);
			}
		}
	}

	return createResponse(null, uploadError);
}
