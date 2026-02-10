import client from "@curiositi/db/client";
import { eq } from "@curiositi/db";
import { files, filesInSpace } from "@curiositi/db/schema";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@curiositi/share/constants";
import write from "@curiositi/share/fs/write";
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

	try {
		const fileData = await client.transaction(async (tx) => {
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

			const fileId = insertedFile[0].id;
			const path = `/curiositi/storage/${orgId}/${fileId}-${sanitizedFileName}`;

			const updatedFile = await tx
				.update(files)
				.set({ path })
				.where(eq(files.id, fileId))
				.returning();

			if (!updatedFile[0]) {
				throw new Error("Failed to update file path");
			}

			try {
				await write(path, file, {
					accessKeyId: s3.accessKeyId,
					secretAccessKey: s3.secretAccessKey,
					bucket: s3.bucket,
					endpoint: s3.endpoint,
				});
			} catch (error) {
				logger.error(`File Upload to S3 Failed: ${file.name}`, error);
				throw error;
			}

			logger.info(`File Uploaded: ${file.name}`, {
				file: file.name,
				path: path,
				size: file.size,
			});

			if (spaceId) {
				await tx.insert(filesInSpace).values({
					fileId: fileId,
					spaceId: spaceId,
				});

				logger.info(`[FILES <=> SPACES] File Added to Space: ${file.name}`, {
					file: file.name,
					path: path,
					size: file.size,
				});
			}

			return updatedFile;
		});

		logger.info(`[FILES] File Added to DB: ${file.name}`, {
			file: file.name,
			size: file.size,
		});

		return createResponse(fileData[0] ?? null, null);
	} catch (error) {
		logger.error(`File Upload Failed: ${file.name}`, error);
		uploadError.db.error = error;
	}

	return createResponse(null, uploadError);
}
