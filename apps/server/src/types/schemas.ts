import { LLM_PROVIDERS, CuriositiAgentMode } from "@curiositi/share/types";
import { z } from "zod";

export const ProviderSchema = z.nativeEnum(LLM_PROVIDERS);

export const UploadSchema = z.object({
  file: z.instanceof(File),
  space_id: z.string().min(1, '"space_id" cannot be empty'),
});

export const SearchSchema = z.object({
  input: z.string().min(1, '"input" cannot be empty'),
  model: z.string(),
  space_ids: z.array(z.string()).optional(),
  file_ids: z.array(z.string()).optional(),
  provider: ProviderSchema,
  thread_id: z.string(),
});

export const STRATEGY_JSON_SCHEMA = z.object({
  strategy: z.enum(["direct", "retrieve"]),
  answer: z.string(),
});

export const QUERY_JSON_SCHEMA = (mode: CuriositiAgentMode) =>
  z.object({
    docQueries:
      mode === "space" ? z.array(z.string()) : z.array(z.string()).optional(),
    webQueries: z.array(z.string()),
  });

export const CreateSpaceSchema = z.object({
  name: z.string().min(1, '"name" cannot be empty'),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const AddOrUpdateApiKeySchema = z.object({
  provider: ProviderSchema,
  api_key: z.string().optional(),
  url: z.string().optional(),
});

// Curiositi Agent Schemas
export const STRATEGY_ANALYSIS_SCHEMA = z.object({
  answerType: z
    .enum(["factual", "analytical", "creative", "comparative"])
    .describe("Type of answer needed"),
  valuableSources: z
    .array(z.string())
    .describe("Which sources would be most valuable"),
  complexityLevel: z
    .enum(["low", "medium", "high"])
    .describe("Complexity level of response required"),
  keyThemes: z
    .array(z.string())
    .describe("Key themes from conversation history"),
  approach: z
    .enum(["comprehensive", "focused"])
    .describe("Whether comprehensive coverage or focused expertise is needed"),
  reasoning: z.string().describe("Detailed reasoning for the strategy"),
});

export const AGENT_RESPONSE_SCHEMA = z.object({
  reasoning: z
    .string()
    .describe(
      "Detailed reasoning process, including how different sources were used",
    ),
  answer: z.string().describe("Comprehensive, well-structured answer"),
  followUpSuggestions: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe(
      "2-3 relevant follow-up questions that the user can ask to get more information. It needs to be from the user's perspective.",
    ),
});

export const RegenerateSchema = z.object({
  thread_id: z.string().min(1, '"thread_id" cannot be empty'),
  model: z.string(),
  provider: ProviderSchema,
  message_id: z.string().min(1, '"message_id" cannot be empty'),
});
