export type CuriositiAgentMode = "general" | "space";

export enum LLM_PROVIDERS {
  OPENROUTER = "openrouter",
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
}

export enum EMBEDDING_PROVIDERS {
  OPENAI = "openai",
}

export enum VECTOR_STORES {
  POSTGRES = "postgres",
}

// Type inference from schema
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
  metadata: {
    timestamp: number;
    requestId: string;
  };
};

// Helper functions to create consistent responses
export const createSuccessResponse = <T>(
  data: T,
  requestId = crypto.randomUUID(),
): ApiResponse<T> => ({
  success: true,
  data,
  metadata: {
    timestamp: Date.now(),
    requestId,
  },
});

export const createErrorResponse = (
  message: string,
  details?: unknown,
  requestId = crypto.randomUUID(),
): ApiResponse => ({
  success: false,
  error: {
    message,
    details,
  },
  metadata: {
    timestamp: Date.now(),
    requestId,
  },
});

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  documentSearches?: string[] | null;
  webSearches?: string[] | null;
  documentSearchResults?: string[] | null;
  webSearchResults?: string[] | null;
};

export type Model = {
  name: string;
  model: string;
  capabilities: string[];
};

export type Provider = {
  name: LLM_PROVIDERS;
  title: string;
  enabled: boolean;
  models: Model[];
};

export type Configs = {
  providers: Provider[];
  file_types: string[];
};

export type ThreadMessage = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  content: string;
  role: "user" | "assistant" | "system";
  threadId: string;
  model: string;
  provider: string;
  documentSearches: string[] | null;
  webSearches: string[] | null;
  documentSearchResults: string[] | null;
  webSearchResults: string[] | null;
  specificFileContent: string[] | null;
  followUpSuggestions: string[];
  strategy: "comprehensive" | "focused" | "hybrid" | "error";
  reasoning: string | null;
};
