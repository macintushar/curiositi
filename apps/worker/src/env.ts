import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		PLATFORM_URL: z.url(),
		WORKER_URL: z.string(),
		S3_ACCESS_KEY_ID: z.string(),
		S3_SECRET_ACCESS_KEY: z.string(),
		S3_BUCKET: z.string(),
		S3_ENDPOINT: z.string(),
    OLLAMA_URL: z.string().optional(),
    QSTASH_TOKEN: z.string(),
		QSTASH_URL: z.string().optional(),
	},

	runtimeEnv: process.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	skipValidation:
		!!process.env.CI || process.env.npm_lifecycle_event === "lint",
	emptyStringAsUndefined: true,
});
