// ============================================================================
// API Response Types
// ============================================================================

export type ApiResponse<T> = {
  data: T;
  error: string | null;
};

export type MessageResponse = {
  message: string;
};

// ============================================================================
// Core Entity Types
// ============================================================================

export type Space = {
  id: string;
  icon: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type File = {
  id: string;
  name: string;
  type: string;
  fileSize: string;
  spaceId: string;
  createdAt: string;
};

export type Thread = {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  spaceId: string | null;
};

export type ThreadMessage = {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  updatedAt: string;
  threadId: string;
  documentSearches: string[] | null;
  webSearches: string[] | null;
  documentSearchResults: string[] | null;
  webSearchResults: string[] | null;
  specificFileContent: string[] | null;
  model: string;
  provider: string;
  confidence?: number;
  followUpSuggestions: string[];
  strategy: "comprehensive" | "focused" | "hybrid" | "error";
  reasoning: string | null;
};

// ============================================================================
// Configuration Types
// ============================================================================

export enum LLM_PROVIDERS {
  OPENROUTER = "openrouter",
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  OLLAMA = "ollama",
}

export enum EMBEDDING_PROVIDERS {
  OPENAI = "openai",
}

export enum VECTOR_STORES {
  POSTGRES = "postgres",
}

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

// ============================================================================
// Agent Types
// ============================================================================

export type CuriositiAgentMode = "general" | "space";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  documentSearches?: string[] | null;
  webSearches?: string[] | null;
  documentSearchResults?: string[] | null;
  webSearchResults?: string[] | null;
};

export type CuriositiAgentResponse = {
  contextSources: {
    documentSpaces: string[];
    specificFiles: string[];
    webSearches: string[];
  };
  answer: string;
  followUpSuggestions: string[];
  strategy: "comprehensive" | "focused" | "hybrid" | "error";
  reasoning: string;
};

// ============================================================================
// Composite Response Types
// ============================================================================

export type SpaceResponse<T> = {
  space: Space;
  user: any; // User type from better-auth
  files: T;
};

export type AllFiles = File & {
  spaceName: string;
  spaceIcon: string;
};

// ============================================================================
// UI/Component Types
// ============================================================================

export type NavLink = {
  href: string;
  label: string;
  isExternal: boolean;
};

export type ProfileLinkGroup = {
  links: {
    url: string;
    icon: React.ReactNode;
    label: string;
    isLinkExternal: boolean;
  }[];
};

export type Context = {
  id: string;
  type: "file" | "space";
  name: string;
};

export type SearchTab = "all" | "documents" | "spaces";

export type SettingsTab = "profile" | "models" | "integrations";

export type Theme = "dark" | "light" | "system";
