import { createQstashClient } from "./providers/qstash";
import { createBunqueueClient } from "./providers/bunqueue";
import type { QueueClient, QueueConfig } from "@curiositi/share/types";

export function createQueueClient(config: QueueConfig): QueueClient {
	if (config.provider === "qstash") {
		return createQstashClient(config.qstash);
	}
	return createBunqueueClient(config.bunqueue);
}
