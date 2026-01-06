import client from "@curiositi/db/client";
import { files } from "@curiositi/db/schema";
import write from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";

export interface UploadHandlerInput {
	file: File;
	orgId: string;
	userId: string;
	s3: {
		accessKeyId: string;
		secretAccessKey: string;
		bucket: string;
		endpoint: string;
	};
}

export default async function uploadHandler({
	file,
	orgId,
	userId,
	s3,
}: UploadHandlerInput) {
	logger.info(`Attempting to Uploading File: ${file.name}`);
	const path = `${orgId}/${file.name}`;

	try {
		await write(file.name, file, {
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
	}

	try {
		const fileData = await client
			.insert(files)
			.values({
				name: file.name,
				path: path,
				organizationId: orgId,
				uploadedById: userId,
				status: "pending",
			})
			.returning();

		return fileData[0] ?? null;
	} catch (error) {
		logger.error(`File Upload to DB Failed: ${file.name}`, error);
		return null;
	}
}
