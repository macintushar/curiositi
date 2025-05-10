import {
  HOST,
  OLLAMA_BASE_URL,
  OLLAMA_EMBEDDING_MODEL,
  OPENROUTER_API_KEY,
} from "@/constants";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOllama } from "ollama-ai-provider";

export const ollama = createOllama({
  baseURL: `${OLLAMA_BASE_URL}/api`,
});

export const ollamaEmbedding = ollama.embedding(OLLAMA_EMBEDDING_MODEL);

export const openRouter = createOpenRouter({
  apiKey: OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": HOST,
    "X-Title": "Curiositi",
  },
});
