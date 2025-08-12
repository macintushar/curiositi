import {
  ANTHROPIC_ENABLED,
  OPENAI_ENABLED,
  OPENROUTER_ENABLED,
  SUPPORTED_FILE_TYPES,
} from "@/constants";
import { Provider, Configs, LLM_PROVIDERS } from "@/types";

export const models: Provider[] = [
  {
    name: LLM_PROVIDERS.OPENAI,
    title: "OpenAI",
    enabled: OPENAI_ENABLED,
    models: [
      {
        name: "GPT-4o",
        model: "gpt-4o",
        capabilities: ["completion", "vision", "audio", "video"],
      },
      {
        name: "GPT-4o-mini",
        model: "gpt-4o-mini",
        capabilities: ["completion", "vision", "audio"],
      },
      {
        name: "GPT-4.1",
        model: "gpt-4.1",
        capabilities: ["completion", "vision"],
      },
      {
        name: "GPT-4.1-mini",
        model: "gpt-4.1-mini",
        capabilities: ["completion", "vision"],
      },
      {
        name: "o1",
        model: "o1",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "o3",
        model: "o3",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "o3-mini",
        model: "o3-mini",
        capabilities: ["completion", "reasoning"],
      },
      {
        name: "o4-mini",
        model: "o4-mini",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "GPT‑4 Turbo",
        model: "gpt-4-turbo",
        capabilities: ["completion", "vision"],
      },
      {
        name: "GPT‑4",
        model: "gpt-4",
        capabilities: ["completion", "vision"],
      },
      {
        name: "GPT‑3.5 Turbo",
        model: "gpt-3.5-turbo",
        capabilities: ["completion"],
      },
    ],
  },
  {
    name: LLM_PROVIDERS.OPENROUTER,
    title: "OpenRouter",
    enabled: OPENROUTER_ENABLED,
    models: [
      {
        name: "MoonshotAI/Kimi-K2",
        model: "moonshotai/kimi-k2:free",
        capabilities: ["completion"],
      },
      {
        name: "OpenRouter/Deepseek-r1 (0528)",
        model: "deepseek/deepseek-r1-0528:free",
        capabilities: ["completion"],
      },
      {
        name: "OpenRouter/Deepseek-r1 (Llama-70B distilled)",
        model: "deepseek/deepseek-r1-distill-llama-70b:free",
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
    title: "Anthropic",
    enabled: ANTHROPIC_ENABLED,
    models: [
      {
        name: "Claude Opus 4 (20250514)",
        model: "claude-opus-4-20250514",
        capabilities: ["completion", "vision"],
      },
      {
        name: "Claude Sonnet 4 (20250514)",
        model: "claude-sonnet-4-20250514",
        capabilities: ["completion", "vision"],
      },
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
      {
        name: "Claude 3.5 Haiku (20241022)",
        model: "claude-3-5-haiku-20241022",
        capabilities: ["completion", "vision"],
      },
      {
        name: "Claude 3.5 Sonnet (20240620)",
        model: "claude-3-5-sonnet-20240620",
        capabilities: ["completion", "vision"],
      },
      {
        name: "Claude 3 Haiku (20240307)",
        model: "claude-3-haiku-20240307",
        capabilities: ["completion", "vision"],
      },
      {
        name: "Claude 3 Opus (20240229)",
        model: "claude-3-opus-20240229",
        capabilities: ["completion", "vision"],
      },
    ],
  },
];

export async function getConfigs(): Promise<Configs> {
  return {
    providers: [...models],
    file_types: SUPPORTED_FILE_TYPES,
  };
}
