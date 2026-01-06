import client from "@curiositi/db/client";
import write from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";

import { files } from "@curiositi/db/schema";
import { env } from "@/env";
type UploadHandlerProps = {
	file: File;
	orgId: string;
	userId: string;
};

export default async function uploadHandler({
	file,
	orgId,
	userId,
}: UploadHandlerProps) {
	logger.info(`Attempting to Uploading File: ${file.name}`);
	const path = `${orgId}/${file.name}`;

	try {
		await write(file.name, file, {
			accessKeyId: env.S3_ACCESS_KEY_ID,
			secretAccessKey: env.S3_SECRET_ACCESS_KEY,
			bucket: env.S3_BUCKET,
			endpoint: env.S3_ENDPOINT,
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

		return fileData[0];
	} catch (error) {
		logger.error(`File Upload to DB Failed: ${file.name}`, error);
	}
}
