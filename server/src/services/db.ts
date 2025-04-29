import { SQL } from "bun";

import { DATABASE_URL } from "@/constants";

export const db = new SQL({
  // Required
  url: DATABASE_URL,

  // Connection pool settings
  max: 20, // Maximum connections in pool
  idleTimeout: 30, // Close idle connections after 30s
  maxLifetime: 0, // Connection lifetime in seconds (0 = forever)
  connectionTimeout: 30, // Timeout when establishing new connections

  tls: true,
  onconnect: () => {
    console.log("Connected to database");
  },
  onclose: () => {
    console.log("Connection closed");
  },
});
