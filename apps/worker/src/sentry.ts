import * as Sentry from "@sentry/bun";
import type { Scope } from "@sentry/bun";

import { env } from "./env";

type WorkerTelemetryContext = {
	operation: string;
	route?: string;
	requestId?: string;
	jobId?: string;
	fileId?: string;
	orgId?: string;
	queueProvider?: string;
	extra?: Record<string, unknown>;
};

const workerSentryDsn = env.WORKER_SENTRY_DSN;

if (workerSentryDsn) {
	Sentry.init({
		dsn: workerSentryDsn,
		environment:
			env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
		enableLogs: true,
		sendDefaultPii: false,
		tracesSampleRate: 1,
	});
}

export const isWorkerSentryEnabled = Boolean(workerSentryDsn);

export function captureWorkerException(
	error: unknown,
	context: WorkerTelemetryContext
) {
	if (!workerSentryDsn) {
		return;
	}

	Sentry.withScope((scope: Scope) => {
		scope.setTag("worker.operation", context.operation);
		scope.setTag(
			"worker.queue_provider",
			context.queueProvider ?? env.QUEUE_PROVIDER
		);

		if (context.route) {
			scope.setTag("worker.route", context.route);
		}

		if (context.requestId) {
			scope.setTag("worker.request_id", context.requestId);
		}

		if (context.jobId) {
			scope.setTag("worker.job_id", context.jobId);
		}

		if (context.fileId) {
			scope.setTag("worker.file_id", context.fileId);
		}

		if (context.orgId) {
			scope.setTag("worker.org_id", context.orgId);
		}

		scope.setContext("worker", {
			operation: context.operation,
			route: context.route,
			requestId: context.requestId,
			jobId: context.jobId,
			fileId: context.fileId,
			orgId: context.orgId,
			queueProvider: context.queueProvider ?? env.QUEUE_PROVIDER,
			...context.extra,
		});

		Sentry.captureException(
			error instanceof Error ? error : new Error(String(error))
		);
	});
}
