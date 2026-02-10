import { S3Client } from "bun";

import logger from "../../logger";
import type { S3Config } from "../../types";

export const S3_ERROR_TYPE = "S3UploadError" as const;

export type S3UploadError = Error & {
	type: typeof S3_ERROR_TYPE;
	originalError: unknown;
	path: string;
};

export const isS3UploadError = (error: unknown): error is S3UploadError => {
	return (
		error instanceof Error &&
		"type" in error &&
		(error as S3UploadError).type === S3_ERROR_TYPE
	);
};

export default async function write(
	path: string,
	data: string | File,
	config: S3Config
): Promise<void> {
	logger.info(`Writing File to S3 Client:`, {
		path,
	});
	const s3Client = new S3Client({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		bucket: config.bucket,
		endpoint: config.endpoint,
	});
	try {
		await s3Client.write(path, data);
	} catch (error) {
		const s3Error = Object.assign(
			new Error(`Failed to write file to S3: ${path}`),
			{
				type: S3_ERROR_TYPE,
				originalError: error,
				path,
			}
		);
		throw s3Error;
	}
	logger.info(`File Written to S3 Client:`, {
		path,
	});
}
