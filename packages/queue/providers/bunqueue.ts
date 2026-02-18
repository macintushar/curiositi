import { Queue } from "bunqueue/client";
import type {
	QueueClient,
	JobPayload,
	BunqueueConfig,
} from "@curiositi/share/types";

import { QUEUE_NAMES } from "@curiositi/share/constants";

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
			await queue.add(payload.type, payload.data);
		},
	};
}
