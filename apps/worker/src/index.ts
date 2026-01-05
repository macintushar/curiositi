import { Hono } from "hono";
import { logger } from "hono/logger";
import uploadRouter from "./routers/upload";

const api = new Hono();

api.use(logger());

api.get("/", (c) => {
	return c.text("Hello Hono!");
});

api.route("/api/v1/upload", uploadRouter);

export default {
	port: 3040,
	...api,
};
