import write from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";
import db from "@curiositi/db/client";
import { files } from "@curiositi/db/schema";

export default async function uploadHandler(file: File) {
	try {
		logger.info(`Ingesting File: ${file.name}`);
		await write(file.name, file, {
			accessKeyId: "60e7a70b61e0953f7eb634262f0ecc66",
			secretAccessKey:
				"5d8c0d035a495d60e7ecee8ca6f9896c50fce6fd0cf080399fec23ea09630ca3",
			bucket: "curiositi-dev",
			endpoint:
				"https://bde4bc52844d339889cafefcf436aced.r2.cloudflarestorage.com",
		});

		logger.info(`File Ingested: ${file.name}`);

		return { message: "File uploaded successfully" };
	} catch (error) {
		logger.error(`File Ingestion Failed: ${file.name}`, error);
		return { error: "File upload failed" };
	}
}
