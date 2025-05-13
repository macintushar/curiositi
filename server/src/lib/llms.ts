import {
  HOST,
  LLM_PROVIDERS,
  OLLAMA_BASE_URL,
  OLLAMA_EMBEDDING_MODEL,
  OPENROUTER_API_KEY,
} from "@/constants";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOllama } from "ollama-ai-provider";

export const ollama = createOllama({
  baseURL: `${OLLAMA_BASE_URL}/api`,
});

export const openRouter = createOpenRouter({
  apiKey: OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": HOST,
    "X-Title": "Curiositi",
  },
});

export function llm(model: string, provider: LLM_PROVIDERS) {
  switch (provider) {
    case LLM_PROVIDERS.OPENROUTER:
      return openRouter(model);

    case LLM_PROVIDERS.OLLAMA:
      return ollama(model);

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export function llmEmbedding(provider: LLM_PROVIDERS) {
  switch (provider) {
    case LLM_PROVIDERS.OLLAMA:
      return ollama.embedding(OLLAMA_EMBEDDING_MODEL);

    default:
      throw new Error(`Embedding not supported for provider: ${provider}`);
  }
}
