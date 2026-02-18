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
			await queue.enqueueJSON({
				url: `${config.workerUrl}/process-file`,
				body: payload.data,
				method: "POST",
			});
		},
	};
}
