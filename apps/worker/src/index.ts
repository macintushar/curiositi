import z from "zod";

import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { requestId, type RequestIdVariables } from "hono/request-id";
import { zValidator } from "@hono/zod-validator";
import { Worker, type Job } from "bunqueue/client";

import { createResponse } from "./utils";
import processFile from "./process-file";
import { createLogger } from "./create-logger";
import { env } from "./env";
import curiositiLogger from "@curiositi/share/logger";
import { QUEUE_NAMES } from "@curiositi/share/constants";

type ProcessFileJobData = {
	fileId: string;
	orgId: string;
};

const api = new Hono<{
	Variables: RequestIdVariables;
}>();

api.use(logger());
api.use(requestId());

api.get("/", (c) => {
	return c.text("Hello from Curiositi Worker!");
});

api.get("/health", (c) => {
	return c.json({ status: "ok" });
});

api.post(
	"/process-file",
	zValidator(
		"json",
		z.object({ fileId: z.string(), orgId: z.string() }),
		async (result, c) => {
			const reqLogger = createLogger(c.var.requestId);
			reqLogger.info("[Process File] API Validation Result", {
				...result,
				body: await c.req.json(),
				error: result.target,
			});
		}
	),
	async (c) => {
		try {
			const { fileId, orgId } = c.req.valid("json");
			const reqLogger = createLogger(c.var.requestId);
			const res = await processFile({ fileId, orgId, logger: reqLogger });
			return c.json(createResponse(res.data, res.error));
		} catch (error) {
			return c.json(createResponse(null, error), 500);
		}
	}
);

api.get("*", serveStatic({ root: "./public" }));

async function startBunqueueWorker() {
	const bunqueueUrl = env.BUNQUEUE_URL ?? "localhost:6789";
	const parts = bunqueueUrl.split(":");
	const host = parts[0] ?? "localhost";
	const port = Number.parseInt(parts[1] ?? "6789", 10);

	const worker = new Worker<ProcessFileJobData>(
		QUEUE_NAMES.INGEST,
		async (job: Job<ProcessFileJobData>) => {
			if (job.name === "processFile") {
				const { fileId, orgId } = job.data;
				const jobLogger = createLogger(`job-${job.id}`);
				await processFile({ fileId, orgId, logger: jobLogger });
			} else {
				curiositiLogger.warn(
					`Unknown job name received: ${job.name}, jobId: ${job.id}`,
					job.asJSON()
				);
			}
		},
		{
			connection: { host, port },
			concurrency: 5,
		}
	);

	worker.on("completed", (job: Job<ProcessFileJobData> | undefined) => {
		if (job) {
			curiositiLogger.info(`Job ${job.id} completed`);
		}
	});

	worker.on(
		"failed",
		(job: Job<ProcessFileJobData> | undefined, error: Error) => {
			curiositiLogger.error(`Job ${job?.id} failed`, error);
		}
	);

	curiositiLogger.info(
		`Bunqueue worker started (connected to ${host}:${port})`
	);
}

if (env.QUEUE_PROVIDER === "local") {
	startBunqueueWorker().catch((error) =>
		curiositiLogger.error("Failed to start Bunqueue worker", error)
	);
} else {
	curiositiLogger.info("QStash mode - HTTP server on port 3040");
}

export default {
	port: 3040,
	...api,
};
