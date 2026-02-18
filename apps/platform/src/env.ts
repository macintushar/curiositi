import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		PLATFORM_URL: z.url(),
		QUEUE_PROVIDER: z.enum(["qstash", "local"]).default("qstash"),
		QSTASH_TOKEN: z.string().optional(),
		WORKER_URL: z.string(),
		BUNQUEUE_URL: z.string().optional(),
		BETTER_AUTH_GOOGLE_CLIENT_ID: z.string(),
		BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string(),
		BETTER_AUTH_SECRET: z.string(),
		S3_ACCESS_KEY_ID: z.string(),
		S3_SECRET_ACCESS_KEY: z.string(),
		S3_BUCKET: z.string(),
		S3_ENDPOINT: z.string(),
	},

	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
		VITE_SENTRY_DSN: z.string().optional(),
		VITE_SENTRY_ORG: z.string().optional(),
		VITE_SENTRY_PROJECT: z.string().optional(),
	},

	runtimeEnvStrict: {
		VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
		VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
		VITE_SENTRY_ORG: import.meta.env.VITE_SENTRY_ORG,
		VITE_SENTRY_PROJECT: import.meta.env.VITE_SENTRY_PROJECT,
		PLATFORM_URL: process.env.PLATFORM_URL,
		BETTER_AUTH_GOOGLE_CLIENT_ID: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
		BETTER_AUTH_GOOGLE_CLIENT_SECRET:
			process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
		S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
		S3_BUCKET: process.env.S3_BUCKET,
		S3_ENDPOINT: process.env.S3_ENDPOINT,
		QUEUE_PROVIDER: process.env.QUEUE_PROVIDER,
		QSTASH_TOKEN: process.env.QSTASH_TOKEN,
		WORKER_URL: process.env.WORKER_URL,
		BUNQUEUE_URL: process.env.BUNQUEUE_URL,
	},

	skipValidation:
		!!process.env.CI || process.env.npm_lifecycle_event === "lint",
	emptyStringAsUndefined: true,
});

if (env.QUEUE_PROVIDER === "qstash") {
	if (!env.QSTASH_TOKEN || !env.WORKER_URL) {
		throw new Error(
			"QSTASH_TOKEN and WORKER_URL are required when QUEUE_PROVIDER=qstash"
		);
	}
}

if (env.QUEUE_PROVIDER === "local") {
	if (!env.BUNQUEUE_URL) {
		throw new Error("BUNQUEUE_URL is required when QUEUE_PROVIDER=local");
	}
}
