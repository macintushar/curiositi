import { OLLAMA_BASE_URL } from "@/constants";
import { Provider, Providers, LLM_PROVIDERS } from "@/types";
import { Ollama } from "ollama";

export const models: Provider[] = [
  {
    name: LLM_PROVIDERS.OPENAI,
    models: [
      "gpt-4o",
      "gpt-4o-mini",
      "o3-mini",
      "o3",
      "o4-mini",
      "gpt-4.1",
      "gpt-4",
    ],
  },
  {
    name: LLM_PROVIDERS.OPENROUTER,
    models: [
      "microsoft/phi-4-reasoning-plus:free",
      "meta-llama/llama-4-maverick:free",
      "meta-llama/llama-4-scout:free",
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-r1-distill-llama-70b:free",
      "deepseek/deepseek-r1-distill-qwen-14b:free",
      "deepseek/deepseek-r1-distill-qwen-32b:free",
      "google/gemini-2.0-flash-exp:free",
    ],
  },
  {
    name: LLM_PROVIDERS.ANTHROPIC,
    models: [
      "claude-3-7-sonnet-20250219",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet-20240620",
    ],
  },
];

// Cache for Ollama models
let ollamaModelsCache: string[] | null = null;
let ollamaModelsCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getOllamaModels(invalidateCache = false) {
  const now = Date.now();

  // Return cached result if available and not expired
  if (
    ollamaModelsCache &&
    !invalidateCache &&
    now - ollamaModelsCacheTime < CACHE_TTL
  ) {
    return ollamaModelsCache;
  }

  try {
    const ollama = new Ollama({ host: OLLAMA_BASE_URL });
    const models = await ollama.list();

    const allModels = await Promise.all(
      models.models.map(
        async (model) =>
          await ollama.show({ model: model.name }).then((res) => ({
            name: model.name,
            // @ts-expect-error capabilities is not typed
            capabilities: res.capabilities as string[],
          })),
      ),
    );

    const chatModels = allModels
      .filter((model) => model.capabilities.includes("completion"))
      .map((model) => model.name);

    // Update cache
    ollamaModelsCache = chatModels;
    ollamaModelsCacheTime = now;

    console.log("Fetching Ollama models");

    return chatModels;
  } catch (error) {
    if (ollamaModelsCache) {
      return ollamaModelsCache;
    }
    throw error;
  }
}

export async function getConfigs(invalidateCache = false): Promise<Providers> {
  return {
    providers: [
      {
        name: LLM_PROVIDERS.OLLAMA,
        models: await getOllamaModels(invalidateCache),
      },
      ...models,
    ],
  };
}
