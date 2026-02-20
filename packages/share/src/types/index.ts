import type { QUEUE_PROVIDER } from "../constants";

export type S3Config = {
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	endpoint: string;
};

export type JobType = "processFile";

export type ProcessFilePayload = {
	fileId: string;
	orgId: string;
};

export type JobPayload = {
	type: JobType;
	data: ProcessFilePayload;
};

export type QueueClient = {
	enqueue(payload: JobPayload): Promise<void>;
};

export type QstashConfig = {
	token: string;
	url?: string;
	workerUrl: string;
};

export type BunqueueConfig = {
	host: string;
	port: number;
};

export type QueueConfig =
	| { provider: QUEUE_PROVIDER.QSTASH; qstash: QstashConfig }
	| { provider: QUEUE_PROVIDER.LOCAL; bunqueue: BunqueueConfig };
