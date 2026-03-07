import z from "zod";

import { Receiver } from "@upstash/qstash";
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
import { captureWorkerException, isWorkerSentryEnabled } from "./sentry";
import curiositiLogger from "@curiositi/share/logger";
import { QUEUE_NAMES } from "@curiositi/share/constants";

type ProcessFileJobData = {
	fileId: string;
	orgId: string;
};

const qstashReceiver =
	env.QUEUE_PROVIDER === "qstash"
		? new Receiver({
				currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
				nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
			})
		: null;

const api = new Hono<{
	Variables: RequestIdVariables;
}>();

api.use(logger());
api.use(requestId());

api.onError((error, c) => {
	const requestId = c.var.requestId;
	const reqLogger = createLogger(requestId);
	reqLogger.error("Unhandled worker request error", {
		error,
		method: c.req.method,
		path: c.req.path,
	});
	captureWorkerException(error, {
		operation: "http-request",
		route: c.req.path,
		requestId,
		extra: {
			method: c.req.method,
		},
	});
	return c.json(createResponse(null, "Internal Server Error"), 500);
});

api.get("/", (c) => {
	return c.text("Hello from Curiositi Worker!");
});

api.get("/health", (c) => {
	return c.json({ status: "ok" });
});

api.post(
	"/process-file",
	async (c, next) => {
		if (env.QUEUE_PROVIDER !== "qstash" || !qstashReceiver) {
			await next();
			return;
		}

		const reqLogger = createLogger(c.var.requestId);
		const signature =
			c.req.header("Upstash-Signature") ?? c.req.header("upstash-signature");

		if (!signature) {
			reqLogger.warn("Rejected process-file request without QStash signature");
			return c.json(createResponse(null, "Missing Upstash signature"), 401);
		}

		const body = await c.req.raw.clone().text();

		try {
			await qstashReceiver.verify({
				body,
				signature,
				url: c.req.url,
			});
			await next();
		} catch (error) {
			reqLogger.warn(
				"Rejected process-file request with invalid QStash signature",
				{
					error: error instanceof Error ? error.message : String(error),
				}
			);
			return c.json(createResponse(null, "Invalid Upstash signature"), 401);
		}
	},
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
			const res = await processFile({
				fileId,
				orgId,
				logger: reqLogger,
				requestId: c.var.requestId,
				route: c.req.path,
			});
			return c.json(createResponse(res.data, res.error));
		} catch (error) {
			captureWorkerException(error, {
				operation: "process-file-request",
				route: c.req.path,
				requestId: c.var.requestId,
			});
			return c.json(createResponse(null, error), 500);
		}
	}
);

api.get("*", serveStatic({ root: "./public" }));

async function startBunqueueWorker() {
	const host = env.BUNQUEUE_HOST;
	const port = env.BUNQUEUE_PORT;

	const worker = new Worker<ProcessFileJobData>(
		QUEUE_NAMES.INGEST,
		async (job: Job<ProcessFileJobData>) => {
			if (job.name === "processFile") {
				const { fileId, orgId } = job.data;
				const jobLogger = createLogger(`job-${job.id}`);
				await processFile({
					fileId,
					orgId,
					logger: jobLogger,
					jobId: String(job.id),
				});
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
			captureWorkerException(error, {
				operation: "bunqueue-job-failed",
				jobId: job ? String(job.id) : undefined,
				fileId: job?.data.fileId,
				orgId: job?.data.orgId,
				extra: {
					jobName: job?.name,
				},
			});
		}
	);

	worker.on("error", (error: Error & { consecutiveErrors?: number }) => {
		curiositiLogger.error(`Worker connection error to ${host}:${port}`, {
			error,
			consecutiveErrors: error.consecutiveErrors,
		});
		captureWorkerException(error, {
			operation: "bunqueue-connection-error",
			extra: {
				host,
				port,
				consecutiveErrors: error.consecutiveErrors,
			},
		});
	});

	curiositiLogger.info(
		`Bunqueue worker started (connected to ${host}:${port})`
	);

	if (isWorkerSentryEnabled) {
		curiositiLogger.info("Worker Sentry monitoring enabled", {
			queueProvider: env.QUEUE_PROVIDER,
		});
	}
}

if (env.QUEUE_PROVIDER === "local") {
	startBunqueueWorker().catch((error) => {
		curiositiLogger.error("Failed to start Bunqueue worker", error);
		captureWorkerException(error, {
			operation: "bunqueue-startup",
			extra: {
				queueProvider: env.QUEUE_PROVIDER,
			},
		});
	});
} else {
	curiositiLogger.info("QStash mode - HTTP server on port 3040");

	if (isWorkerSentryEnabled) {
		curiositiLogger.info("Worker Sentry monitoring enabled", {
			queueProvider: env.QUEUE_PROVIDER,
		});
	}
}

export default {
	port: 3040,
	...api,
};
