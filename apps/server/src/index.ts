import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import apiRouter from "@/routes/api";

const app = new OpenAPIHono();
import { auth } from "./lib/auth";
import { TRUSTED_ORIGINS } from "./constants";
import { html, raw } from "hono/html";

app.use("*", logger());

app.get("/", async (c) => {
  const logoSvg = await Bun.file("../web/src/assets/logo.svg").text();
  const isSingleOrigin = TRUSTED_ORIGINS[0] === TRUSTED_ORIGINS[1];
  return c.html(html`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Curiositi</title>
        <meta
          name="description"
          content="Curiositi is an AI-powered knowledge workspace. Upload documents, organize them into spaces, and chat with an agent that searches your docs and the web."
        />
        <meta
          name="keywords"
          content="Curiositi, AI, Knowledge, Workspace, Documents, Spaces, Chat, Agent, Retrieval-Augmented Generation"
        />
        <meta name="author" content="Curiositi" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link
          rel="icon"
          href="${TRUSTED_ORIGINS[1]}/favicon.svg"
          sizes="48x48"
          type="image/svg+xml"
        />
        <link
          id="favicon"
          rel="icon"
          href="${TRUSTED_ORIGINS[1]}/favicon.svg"
          sizes="any"
          type="image/svg+xml"
        />
        <link rel="apple-touch-icon" href="${TRUSTED_ORIGINS[1]}/favicon.svg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />

        <style>
          .instrument-sans {
            font-family: "Instrument Sans", sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-style: normal;
            font-variation-settings: "wdth" 100;
          }
          .instrument-serif-regular {
            font-family: "Instrument Serif", serif;
            font-weight: 400;
            font-style: normal;
          }
          body {
            background-color: #e7e5e4;
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 16px;
          }

          .card {
            background-color: #f5f5f4;
            border: 1px solid #d6d3d1;
            border-radius: 16px;
            padding: 64px;
            height: fit-content;
            width: 50%;
            text-align: center;

            padding-bottom: 16px;
            padding-top: 16px;
            padding-left: 16px;
            padding-right: 16px;
          }

          .primary {
            color: #064e3b;
            font-size: 64px;
            line-height: 64px;
          }

          footer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .logo {
            height: 40px;
          }

          .logo > svg {
            height: 100%;
            width: 100%;
          }

          .styled-link {
            color: #064e3b;
            text-decoration: none;
            font-weight: 500;
            background-color: #064e3b20;
            padding: 2px 2px;
          }
        </style>
      </head>
      <body class="instrument-sans">
        <div class="card">
          <h1 class="instrument-serif-regular primary">
            Hello from Curiositi! 🚀
          </h1>
          <!-- <br /> -->
          <p>
            Curiositi's official SaaS platform is available at
            <a class="styled-link" href="${TRUSTED_ORIGINS[0]}"
              >${TRUSTED_ORIGINS[0]}</a
            >
          </p>
          ${!isSingleOrigin &&
          html` <p>
            Use this deployment at
            <a class="styled-link" href="${TRUSTED_ORIGINS[1]}"
              >${TRUSTED_ORIGINS[1]}</a
            >
          </p>`}
        </div>
        <footer class="card">
          <a
            href="https://curiositi.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="logo">${raw(logoSvg)}</div></a
          >

          <div>
            <p>
              <a
                href="https://github.com/macintushar/curiositi"
                target="_blank"
                rel="noopener noreferrer"
                >GitHub</a
              >
              |
              <a
                href="https://github.com/macintushar/curiositi/blob/main/docs/getting-started.md"
                target="_blank"
                rel="noopener noreferrer"
                >Docs</a
              >
            </p>
          </div>
        </footer>
      </body>
    </html>
  `);
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    message: "Curiositi API Server is running",
  });
});

app.use(
  "*",
  cors({
    origin: TRUSTED_ORIGINS,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Set-Cookie",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
      "Cookie",
    ],
    allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE", "PUT"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/v1", apiRouter);

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Curiositi API",
    description: "AI-powered knowledge workspace API for document management and search",
  },
});

export default app;
