import app from "./src";
import {
  OLLAMA_BASE_URL,
  SEARXNG_URL,
  PORT,
  DATABASE_URL,
  DEFAULT_EMBEDDING_PROVIDER,
  SENTRY_DSN,
} from "./src/constants";

import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: SENTRY_DSN,
});

try {
  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });
  console.log("Server is running on port", PORT);
  console.log(
    `Ollama URL: ${OLLAMA_BASE_URL}
    SearXNG URL: ${SEARXNG_URL}
    Database URL: ${DATABASE_URL}
    Default Embedding Provider: ${DEFAULT_EMBEDDING_PROVIDER}`,
  );
} catch (error) {
  console.error(error);
  Sentry.captureException(error);
}
