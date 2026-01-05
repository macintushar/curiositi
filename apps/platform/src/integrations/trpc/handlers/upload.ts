import client from "@curiositi/db/client";
import write from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";

import { files } from "@curiositi/db/schema";
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
			accessKeyId: "60e7a70b61e0953f7eb634262f0ecc66",
			secretAccessKey:
				"5d8c0d035a495d60e7ecee8ca6f9896c50fce6fd0cf080399fec23ea09630ca3",
			bucket: "curiositi-dev",
			endpoint:
				"https://bde4bc52844d339889cafefcf436aced.r2.cloudflarestorage.com",
		});
		logger.info(`File Uploaded: ${file.name}`, {
			file: file.name,
			path: path,
			size: file.size,
		});
	} catch (error) {
		logger.error(`File Upload Failed: ${file.name}`, error);
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

		return fileData;
	} catch (error) {
		logger.error(`File Upload Failed: ${file.name}`, error);
	}
}
