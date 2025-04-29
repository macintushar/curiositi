import app from "./src";
import {
  CHROMA_URL,
  OLLAMA_BASE_URL,
  SEARXNG_URL,
  SERVER_PORT,
} from "./src/constants";

try {
  Bun.serve({
    port: SERVER_PORT,
    fetch: app.fetch,
  });
  console.log("Server is running on port", SERVER_PORT);
  console.log(
    `Ollama_URL: ${OLLAMA_BASE_URL}\nSearXNG_URL: ${SEARXNG_URL}\nChroma_URL: ${CHROMA_URL}`
  );
} catch (error) {
  console.error(error);
}
