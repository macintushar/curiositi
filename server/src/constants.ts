// Host
export const HOST = process.env.HOST || "https://api.curiositi.macintushar.xyz";

// Server
export const SERVER_PORT = process.env.SERVER_PORT || 3030;

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/dbname";

// Better Auth
export const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || "your-secret-key-at-least-32-chars-long";
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || HOST;

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

export enum LLM_PROVIDERS {
  OPENROUTER = "openrouter",
  OLLAMA = "ollama",
}
