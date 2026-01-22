import { S3Client } from "bun";

import logger from "../../logger";
import type { S3Config } from "../../types";

// Keeping S3 Config needing to be passed in to allow BYO Storage

export default async function write(
	path: string,
	data: string | File,
	config: S3Config
) {
	logger.info(`Writing File to S3 Client:`, {
		path,
	});
	const s3Client = new S3Client({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		bucket: config.bucket,
		endpoint: config.endpoint,
	});
	await s3Client.write(path, data);
	logger.info(`File Written to S3 Client:`, {
		path,
	});
}
