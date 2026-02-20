import { Queue } from "bunqueue/client";
import type {
	QueueClient,
	JobPayload,
	BunqueueConfig,
} from "@curiositi/share/types";

import { QUEUE_NAMES } from "@curiositi/share/constants";
import logger from "@curiositi/share/logger";

let queue: Queue | null = null;

export function createBunqueueClient(config: BunqueueConfig): QueueClient {
	if (!queue) {
		queue = new Queue(QUEUE_NAMES.INGEST, {
			connection: { host: config.host, port: config.port },
		});
	}

	return {
		async enqueue(payload: JobPayload): Promise<void> {
			if (!queue) {
				throw new Error("Queue not initialized");
			}
			try {
				const job = await queue.add(payload.type, payload.data);
				logger.info(`Enqueued job ${payload.type}`, { jobId: job.id });
			} catch (error) {
				logger.error(`Failed to enqueue job ${payload.type}`, error);
				throw new Error(
					`Failed to enqueue job ${payload.type}: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		},
	};
}
