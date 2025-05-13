import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import apiRouter from "@/routes/api";

const app = new Hono();
import { auth } from "./lib/auth";

app.use("*", logger());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "*",
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://curiositi.macintushar.xyz",
            "https://api.curiositi.macintushar.xyz",
          ]
        : "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/v1", apiRouter);

export default app;
