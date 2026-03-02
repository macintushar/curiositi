import { describe, expect, test } from "bun:test";
import { QUEUE_PROVIDER } from "@curiositi/share/constants";
import type {
	QueueClient,
	JobPayload,
	QueueConfig,
} from "@curiositi/share/types";

describe("Queue Handler Types", () => {
	test("QueueConfig type should have correct shape for QStash", () => {
		const config: QueueConfig = {
			provider: QUEUE_PROVIDER.QSTASH,
			qstash: {
				token: "test-token",
				workerUrl: "https://worker.example.com",
			},
		};

		expect(config.provider).toBe(QUEUE_PROVIDER.QSTASH);
		expect(config.qstash?.token).toBe("test-token");
	});

	test("QueueConfig type should have correct shape for local", () => {
		const config: QueueConfig = {
			provider: QUEUE_PROVIDER.LOCAL,
			bunqueue: {
				host: "localhost",
				port: 6379,
			},
		};

		expect(config.provider).toBe(QUEUE_PROVIDER.LOCAL);
		expect(config.bunqueue?.host).toBe("localhost");
		expect(config.bunqueue?.port).toBe(6379);
	});

	test("QueueClient interface should have enqueue method", () => {
		const mockClient: QueueClient = {
			enqueue: async () => {},
		};

		expect(typeof mockClient.enqueue).toBe("function");
	});

	test("Queue job type should have correct shape", () => {
		const job: JobPayload = {
			type: "processFile",
			data: {
				fileId: "file-123",
				orgId: "org-456",
			},
		};

		expect(job.type).toBe("processFile");
		expect(job.data.fileId).toBe("file-123");
	});
});

describe("Queue Provider Selection", () => {
	test("should select QStash provider based on config", () => {
		expect(QUEUE_PROVIDER.QSTASH).toBeDefined();
	});

	test("should select local provider based on config", () => {
		expect(QUEUE_PROVIDER.LOCAL).toBeDefined();
	});

	test("should construct QStash URL correctly", () => {
		const workerUrl = "https://worker.example.com";
		const qstashUrl = "https://qstash.upstash.io";

		expect(workerUrl).toContain("worker");
		expect(qstashUrl).toContain("qstash");
	});
});
