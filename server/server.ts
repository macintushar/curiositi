import app from "./src";
import { SERVER_PORT } from "./src/constants";

try {
  Bun.serve({
    port: SERVER_PORT,
    fetch: app.fetch,
  });
  console.log("Server is running on port", SERVER_PORT);
} catch (error) {
  console.error(error);
}
