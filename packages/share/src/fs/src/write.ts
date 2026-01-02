import { S3Client } from "bun";

import { STORAGE_PATH_PREFIX } from "../../constants";
import logger from "../../logger";

export default async function write(
	name: string,
	data: string | File,
	storagemode: "filesystem" | "s3",
	config?: {
		accessKeyId: string;
		secretAccessKey: string;
		bucket: string;
		endpoint: string;
	}
) {
	logger.info(`Writing File to ${storagemode}: ${name}`);
	if (storagemode === "filesystem") {
		await Bun.write(STORAGE_PATH_PREFIX + name, data);
		logger.info(`File Written to Filesystem: ${name}`);
	} else {
		const s3Client = new S3Client({
			accessKeyId: config?.accessKeyId,
			secretAccessKey: config?.secretAccessKey,
			bucket: config?.bucket,
			endpoint: config?.endpoint,
		});
		await s3Client.write(name, data);
		logger.info(`File Written to S3 Client: ${name}`);
	}
}
