import { OLLAMA_BASE_URL } from "@/constants";
import { Provider, Providers, LLM_PROVIDERS, Model } from "@/types";
import { Ollama } from "ollama";

export const models: Provider[] = [
  {
    name: LLM_PROVIDERS.OPENAI,
    models: [
      {
        name: "GPT-4o",
        model: "gpt-4o",
        capabilities: ["completion", "vision"],
      },
      {
        name: "GPT-4o-mini",
        model: "gpt-4o-mini",
        capabilities: ["completion", "vision"],
      },
      {
        name: "o3-mini",
        model: "o3-mini",
        capabilities: ["completion"],
      },
      {
        name: "o3",
        model: "o3",
        capabilities: ["completion", "vision"],
      },
      {
        name: "o4-mini",
        model: "o4-mini",
        capabilities: ["completion", "vision"],
      },
    ],
  },
  {
    name: LLM_PROVIDERS.OPENROUTER,
    models: [
      {
        name: "Microsoft/Phi-4 Reasoning Plus",
        model: "microsoft/phi-4-reasoning-plus:free",
        capabilities: ["completion"],
      },
      {
        name: "Meta/Llama-4 Maverick",
        model: "meta-llama/llama-4-maverick:free",
        capabilities: ["completion"],
      },
      {
        name: "Meta/Llama-4 Scout",
        model: "meta-llama/llama-4-scout:free",
        capabilities: ["completion"],
      },
      {
        name: "OpenRouter/Deepseek-r1",
        model: "deepseek/deepseek-r1:free",
        capabilities: ["completion"],
      },
      {
        name: "OpenRouter/Deepseek-r1 (Llama-70B distilled)",
        model: "deepseek/deepseek-r1-distill-llama-70b:free",
        capabilities: ["completion"],
      },
      {
        name: "OpenRouter/Deepseek-r1 (Qwen-32B distilled)",
        model: "deepseek/deepseek-r1-distill-qwen-32b:free",
        capabilities: ["completion"],
      },
      {
        name: "Google/Gemini 2.0 Flash (Experimental)",
        model: "google/gemini-2.0-flash-exp:free",
        capabilities: ["completion"],
      },
    ],
  },
  {
    name: LLM_PROVIDERS.ANTHROPIC,
    models: [
      {
        name: "Claude 3.7 Sonnet (20250219)",
        model: "claude-3-7-sonnet-20250219",
        capabilities: ["completion", "vision"],
      },
      {
        name: "Claude 3.5 Sonnet (20241022)",
        model: "claude-3-5-sonnet-20241022",
        capabilities: ["completion", "vision"],
      },
    ],
  },
];

// Cache for Ollama models
let ollamaModelsCache: Model[] | null = null;
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
      .map((model) => ({
        name: model.name,
        model: model.name,
        capabilities: model.capabilities,
      }));

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
