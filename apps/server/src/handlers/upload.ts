import write from "@curiositi/share/fs/write";
import logger from "@curiositi/share/logger";

export default async function uploadHandler(file: File) {
	try {
		logger.info(`Ingesting File: ${file.name}`);
		await write(file.name, file, "filesystem");

		logger.info(`File Ingested: ${file.name}`);

		return { message: "File uploaded successfully" };
	} catch (error) {
		logger.error(`File Ingestion Failed: ${file.name}`, error);
		return { error: "File upload failed" };
	}
}
