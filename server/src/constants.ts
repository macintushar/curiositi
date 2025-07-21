import { EMBEDDING_PROVIDERS } from "./types";

// Server
export const SERVER_PORT = process.env.SERVER_PORT || 3030;

// Default Providers
export const DEFAULT_EMBEDDING_PROVIDER =
  (process.env.DEFAULT_EMBEDDING_PROVIDER as EMBEDDING_PROVIDERS) ||
  EMBEDDING_PROVIDERS.OLLAMA;

// Host
export const HOST =
  process.env.NODE_ENV === "production"
    ? "https://api.curiositi.macintushar.xyz"
    : `http://localhost:${SERVER_PORT}`;

export const UI_HOST = process.env.UI_HOST || "http://localhost:3040";

export const TRUSTED_ORIGINS = ["https://curiositi.macintushar.xyz", UI_HOST];

// Database
export const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/dbname";

// Better Auth
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set – refusing to start without a signing secret.",
  );
}

export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
export const BETTER_AUTH_URL = HOST;

// Ollama
export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL || "snowflake-arctic-embed2:latest";

// OpenRouter
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_ENABLED = OPENROUTER_API_KEY ? true : false;

// OpenAI
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
export const OPENAI_ENABLED = OPENAI_API_KEY ? true : false;

// Anthropic
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
export const ANTHROPIC_ENABLED = ANTHROPIC_API_KEY ? true : false;

// SearXNG
export const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8095";

// Sentry
export const SENTRY_DSN = process.env.SENTRY_DSN;

// File Types

export const OFFICE_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.oasis.opendocument.text", // odt
  "application/vnd.oasis.opendocument.presentation", // odp
  "application/vnd.oasis.opendocument.spreadsheet", // ods
];

export const PDF_FILE_TYPE = "application/pdf";

export const TEXT_FILE_TYPES = ["text/plain", "text/csv", "text/markdown"];

export const SUPPORTED_FILE_TYPES = [
  PDF_FILE_TYPE,
  ...TEXT_FILE_TYPES,
  ...OFFICE_FILE_TYPES,
];

// Ollama Capabilities
export const OLLAMA_CAPABILITIES = ["completion", "tools"];
