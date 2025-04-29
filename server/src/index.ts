import { Hono } from "hono";
import { logger } from "hono/logger";

import uploadRoutes from "@/routes/upload";
import queryRouter from "@/routes/query";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const apiRouter = new Hono();
apiRouter.basePath("/api/v1");

apiRouter.route("/upload", uploadRoutes);
apiRouter.route("/query", queryRouter);

app.route("/api/v1", apiRouter);

export default app;
