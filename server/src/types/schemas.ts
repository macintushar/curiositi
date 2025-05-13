import { LLM_PROVIDERS } from "@/constants";
import { z } from "zod";
import { CuriositiAgentMode } from ".";

export const UploadSchema = z.object({
  file: z.instanceof(File),
  space_id: z.string().min(1, '"space_id" cannot be empty'),
});

export const SearchSchema = z.object({
  input: z.string().min(1, '"input" cannot be empty'),
  model: z.string().optional().default("gemma3:1b"),
  session_id: z.string().min(1, '"session_id" cannot be empty'),
  space_id: z.string(),
  provider: z.nativeEnum(LLM_PROVIDERS).default(LLM_PROVIDERS.OLLAMA),
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
});
