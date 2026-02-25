import { Client } from "@upstash/qstash";
import type {
	QueueClient,
	JobPayload,
	QstashConfig,
} from "@curiositi/share/types";
import { QUEUE_NAMES } from "@curiositi/share/constants";

export function createQstashClient(config: QstashConfig): QueueClient {
	const client = new Client({
		token: config.token,
		baseUrl: config.url,
	});

	const queue = client.queue({ queueName: QUEUE_NAMES.INGEST });

	return {
		async enqueue(payload: JobPayload): Promise<void> {
			try {
				await queue.enqueueJSON({
					url: `${config.workerUrl}/process-file`,
					body: payload.data,
					method: "POST",
				});
			} catch (error) {
				throw new Error(
					`Failed to enqueue job ${payload.type}: ${error instanceof Error ? error.message : String(error)}`
				);
			}
		},
	};
}
