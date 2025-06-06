import {
  ANTHROPIC_API_KEY,
  HOST,
  OLLAMA_BASE_URL,
  OLLAMA_EMBEDDING_MODEL,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL,
  OPENROUTER_API_KEY,
} from "@/constants";
import { EMBEDDING_PROVIDERS, LLM_PROVIDERS } from "@/types";

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ollama-ai-provider";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

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

export const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
  compatibility: "strict",
});

export const anthropic = createAnthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export function llm(model: string, provider: LLM_PROVIDERS) {
  switch (provider) {
    case LLM_PROVIDERS.OPENROUTER:
      return openRouter(model);

    case LLM_PROVIDERS.OLLAMA:
      return ollama(model);

    case LLM_PROVIDERS.OPENAI:
      return openai(model);

    case LLM_PROVIDERS.ANTHROPIC:
      return anthropic(model);

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export function llmEmbedding(provider: EMBEDDING_PROVIDERS) {
  switch (provider) {
    case EMBEDDING_PROVIDERS.OLLAMA:
      return ollama.embedding(OLLAMA_EMBEDDING_MODEL);

    case EMBEDDING_PROVIDERS.OPENAI:
      return openai.embedding(OPENAI_EMBEDDING_MODEL, { dimensions: 1024 });

    default:
      throw new Error(`Embedding not supported for provider: ${provider}`);
  }
}
