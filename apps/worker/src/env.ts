import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		S3_ACCESS_KEY_ID: z.string(),
		S3_SECRET_ACCESS_KEY: z.string(),
		S3_BUCKET: z.string(),
		S3_ENDPOINT: z.string(),
		POSTGRES_URL: z.url(),
		QUEUE_PROVIDER: z.enum(["qstash", "local"]).default("qstash"),
		BUNQUEUE_HOST: z.string().default("localhost"),
		BUNQUEUE_PORT: z.coerce.number().default(6789),
	},

	clientPrefix: "PUBLIC_",

	client: {},

	runtimeEnvStrict: {
		S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
		S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
		S3_BUCKET: process.env.S3_BUCKET,
		S3_ENDPOINT: process.env.S3_ENDPOINT,
		POSTGRES_URL: process.env.POSTGRES_URL,
		QUEUE_PROVIDER: process.env.QUEUE_PROVIDER,
		BUNQUEUE_HOST: process.env.BUNQUEUE_HOST,
		BUNQUEUE_PORT: process.env.BUNQUEUE_PORT,
	},

	skipValidation:
		!!process.env.CI || process.env.npm_lifecycle_event === "lint",
	emptyStringAsUndefined: false,
});
