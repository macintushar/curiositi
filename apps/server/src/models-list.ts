import {
  ANTHROPIC_ENABLED,
  OPENAI_ENABLED,
  OPENROUTER_ENABLED,
} from "@/constants";
import { LLM_PROVIDERS, Provider } from "./types";

const models: Provider[] = [
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
        name: "GPT-4o mini",
        model: "gpt-4o-mini",
        capabilities: ["completion", "vision", "audio"],
      },
      {
        name: "GPT-5",
        model: "gpt-5",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "GPT-5 mini",
        model: "gpt-5-mini",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "o3",
        model: "o3",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "o4-mini",
        model: "o4-mini",
        capabilities: ["completion", "vision", "reasoning"],
      },
    ],
  },
  {
    name: LLM_PROVIDERS.OPENROUTER,
    title: "OpenRouter",
    enabled: OPENROUTER_ENABLED,
    models: [
      {
        name: "MoonshotAI: Kimi K2",
        model: "moonshotai/kimi-k2:free",
        capabilities: ["completion", "free"],
      },
      {
        name: "OpenAI: gpt-oss-120b",
        model: "openai/gpt-oss-120b:free",
        capabilities: ["completion", "reasoning", "free"],
      },
      {
        name: "Z.AI: GLM 4.5 Air",
        model: "z-ai/glm-4.5-air:free",
        capabilities: ["completion", "reasoning", "free"],
      },
    ],
  },
  {
    name: LLM_PROVIDERS.ANTHROPIC,
    title: "Anthropic",
    enabled: ANTHROPIC_ENABLED,
    models: [
      {
        name: "Claude Opus 4.1",
        model: "claude-opus-4-1-20250805",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "Claude Sonnet 4",
        model: "claude-sonnet-4-20250514",
        capabilities: ["completion", "vision", "reasoning"],
      },
      {
        name: "Claude 3.5 Sonnet",
        model: "claude-3-5-sonnet-20241022",
        capabilities: ["completion", "vision", "reasoning"],
      },
    ],
  },
];

export default models;
