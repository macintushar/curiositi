export type CuriositiAgentMode = "general" | "space";

export enum LLM_PROVIDERS {
  OPENROUTER = "openrouter",
  OLLAMA = "ollama",
  OPENAI = "openai",
}

export enum EMBEDDING_PROVIDERS {
  OLLAMA = "ollama",
  OPENAI = "openai",
}

export enum VECTOR_STORES {
  CHROMA = "chroma",
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
