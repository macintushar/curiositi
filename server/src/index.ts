import { Hono } from "hono";
import { logger } from "hono/logger";

import queryRouter from "@/routes/query";
import uploadRoutes from "@/routes/upload";
import spacesRouter from "@/routes/spaces";
import filesRouter from "@/routes/files";

const app = new Hono();

app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const apiRouter = new Hono();
apiRouter.basePath("/api/v1");

apiRouter.route("/upload", uploadRoutes);
apiRouter.route("/query", queryRouter);
apiRouter.route("/spaces", spacesRouter);
apiRouter.route("/files", filesRouter);

app.route("/api/v1", apiRouter);

export default app;
