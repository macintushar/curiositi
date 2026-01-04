import { S3Client } from "bun";

import logger from "../../logger";

export default async function write(
	name: string,
	data: string | File,
	config?: {
		accessKeyId: string;
		secretAccessKey: string;
		bucket: string;
		endpoint: string;
	}
) {
	logger.info(`Writing File to S3 Client: ${name}`);
	const s3Client = new S3Client({
		accessKeyId: config?.accessKeyId,
		secretAccessKey: config?.secretAccessKey,
		bucket: config?.bucket,
		endpoint: config?.endpoint,
	});
	await s3Client.write(name, data);
	logger.info(`File Written to S3 Client: ${name}`);
}
