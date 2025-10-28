// Re-export shared types
export * from "@curiositi/share";

// Server-specific ThreadMessage with Date types instead of string
export type ServerThreadMessage = {
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

export type SearchResult = {
  title: string;
  content: string;
  source: string;
};
