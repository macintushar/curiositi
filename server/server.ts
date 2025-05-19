import app from "./src";
import {
  OLLAMA_BASE_URL,
  SEARXNG_URL,
  SERVER_PORT,
  DATABASE_URL,
  DEFAULT_EMBEDDING_PROVIDER,
} from "./src/constants";

try {
  Bun.serve({
    port: SERVER_PORT,
    fetch: app.fetch,
  });
  console.log("Server is running on port", SERVER_PORT);
  console.log(
    `Ollama URL: ${OLLAMA_BASE_URL}
    SearXNG URL: ${SEARXNG_URL}
    Database URL: ${DATABASE_URL}
    Default Embedding Provider: ${DEFAULT_EMBEDDING_PROVIDER}`,
  );
} catch (error) {
  console.error(error);
}
