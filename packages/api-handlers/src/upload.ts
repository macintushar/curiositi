import client from "@curiositi/db/client";
import { files, filesInSpace } from "@curiositi/db/schema";
import write from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";
import type { S3Config } from "@curiositi/share/types";
import { createResponse } from "./response";
import { hash } from "bun";

export type UploadHandlerInput = {
	file: File;
	orgId: string;
	userId: string;
	spaceId?: string;
	tags?: string[];
	s3: S3Config;
};

type UploadError = {
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
	const fileHash = hash(await file.arrayBuffer());
	const path = `/curiositi/storage/${orgId}/${fileHash}-${file.name}`;

	const uploadError: UploadError = {
		s3: {
			error: null,
		},
		db: {
			error: null,
		},
	};

	try {
		await write(path, file, {
			accessKeyId: s3.accessKeyId,
			secretAccessKey: s3.secretAccessKey,
			bucket: s3.bucket,
			endpoint: s3.endpoint,
		});

		logger.info(`File Uploaded: ${file.name}`, {
			file: file.name,
			path: path,
			size: file.size,
		});
	} catch (error) {
		logger.error(`File Upload to S3 Failed: ${file.name}`, error);
		uploadError.s3.error = error;
		return createResponse(null, uploadError);
	}

	try {
		const fileData = await client
			.insert(files)
			.values({
				name: file.name,
				path: path,
				type: file.type,
				size: file.size,
				organizationId: orgId,
				uploadedById: userId,
				status: "pending",
				tags: { tags: tags ?? [] },
			})
			.returning();

		logger.info(`[FILES] File Added to DB: ${file.name}`, {
			file: file.name,
			path: path,
			size: file.size,
		});

		if (!fileData[0]) {
			return createResponse(null, uploadError);
		}

		if (spaceId) {
			await client.insert(filesInSpace).values({
				fileId: fileData[0].id,
				spaceId: spaceId,
			});

			logger.info(`[FILES <=> SPACES] File Added to Space: ${file.name}`, {
				file: file.name,
				path: path,
				size: file.size,
			});
		}

		return createResponse(fileData[0] ?? null, null);
	} catch (error) {
		logger.error(`File Upload to DB Failed: ${file.name}`, error);
		uploadError.db.error = error;
	}

	return createResponse(null, uploadError);
}
