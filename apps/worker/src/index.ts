import { createResponse } from "@curiositi/api-handlers";
import { Hono } from "hono";
import { logger } from "hono/logger";

const api = new Hono();

api.use(logger());

api.get("/", (c) => {
	return c.text("Hello from Curiositi Worker!");
});

api.post("/api/v1/process-file", (c) => {
	return c.json(
		createResponse({ message: "File processed successfully!" }, null)
	);
});

export default {
	port: 3040,
	...api,
};
