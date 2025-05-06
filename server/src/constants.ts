// Host
export const HOST = process.env.HOST || "https://curiositi.macintushar.xyz";

// Server
export const SERVER_PORT = process.env.SERVER_PORT || 3030;

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/dbname";

// Chroma
export const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8090";
export const CHROMA_COLLECTION_NAME = "curiositi_docs";

// Ollama
export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL || "snowflake-arctic-embed2:latest";

// OpenRouter
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_ENABLED = OPENROUTER_API_KEY ? true : false;

// SearXNG
export const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8095";

// File Types

export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain;charset=utf-8",
  "text/plain",
  "text/csv",
  "text/markdown",
];

export const QUERY_JSON_STRUCTURE = {
  type: "object",
  properties: {
    docQueries: {
      type: "array",
      items: {
        type: "string",
      },
    },
    webQueries: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["docQueries", "webQueries"],
};

export const STRATEGY_JSON_SCHEMA = {
  type: "object",
  properties: {
    strategy: {
      type: "string",
      enum: ["direct", "retrieve"],
    },
    answer: {
      type: "string",
    },
  },
  required: ["strategy"],
  oneOf: [
    {
      properties: { strategy: { const: "direct" }, answer: { type: "string" } },
      required: ["strategy", "answer"],
    },
    {
      properties: { strategy: { const: "retrieve" } },
      required: ["strategy"],
    },
  ],
};
