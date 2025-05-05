import app from "./src";
import {
  CHROMA_URL,
  OLLAMA_BASE_URL,
  SEARXNG_URL,
  SERVER_PORT,
  DATABASE_URL,
} from "./src/constants";

try {
  Bun.serve({
    port: SERVER_PORT,
    fetch: app.fetch,
  });
  console.log("Server is running on port", SERVER_PORT);
  console.log(
    `Ollama URL: ${OLLAMA_BASE_URL}\nSearXNG URL: ${SEARXNG_URL}\nChroma URL: ${CHROMA_URL}\nDatabase URL: ${DATABASE_URL}`,
  );
} catch (error) {
  console.error(error);
}
