import { createQueueClient } from "@curiositi/queue";
import type { QueueClient } from "@curiositi/share/types";
import { createResponse } from "./response";
import { QUEUE_PROVIDER } from "@curiositi/share/constants";

type EnqueueFileForProcessingParams =
	| {
			provider: QUEUE_PROVIDER.QSTASH;
			fileId: string;
			orgId: string;
			qstashToken: string;
			workerUrl: string;
			qstashUrl?: string;
	  }
	| {
			provider: QUEUE_PROVIDER.LOCAL;
			fileId: string;
			orgId: string;
			bunqueueUrl: string;
	  };

let queueClient: QueueClient | null = null;

function getQueueClient(params: EnqueueFileForProcessingParams): QueueClient {
	if (queueClient) {
		return queueClient;
	}

	if (params.provider === "qstash") {
		queueClient = createQueueClient({
			provider: QUEUE_PROVIDER.QSTASH,
			qstash: {
				token: params.qstashToken,
				url: params.qstashUrl,
				workerUrl: params.workerUrl,
			},
		});
	} else {
		const parts = params.bunqueueUrl.split(":");
		const host = parts[0] ?? "localhost";
		const port = Number.parseInt(parts[1] ?? "6789", 10);
		queueClient = createQueueClient({
			provider: QUEUE_PROVIDER.LOCAL,
			bunqueue: { host, port },
		});
	}

	return queueClient;
}

export async function enqueueFileForProcessing(
	params: EnqueueFileForProcessingParams
) {
	try {
		const client = getQueueClient(params);
		await client.enqueue({
			type: "processFile",
			data: {
				fileId: params.fileId,
				orgId: params.orgId,
			},
		});
		return createResponse({ success: true }, null);
	} catch (error) {
		return createResponse(null, error);
	}
}
