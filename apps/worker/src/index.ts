import { createResponse } from "./utils";

import z from "zod";

import { Hono } from "hono";
import { logger } from "hono/logger";
import { requestId, type RequestIdVariables } from "hono/request-id";
import { zValidator } from "@hono/zod-validator";
import processFile from "./process-file";
import { createLogger } from "./create-logger";
import { serveStatic } from "hono/bun";

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

export default {
	port: 3040,
	...api,
};
