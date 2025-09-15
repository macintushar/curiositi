import type { User } from "better-auth/types";

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

export type ApiResponse<T> = {
  data: T;
  error: string | null;
};

export type MessageResponse = {
  message: string;
};

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

export type Model = {
  name: string;
  model: string;
  capabilities: string[];
};

export type Provider = {
  name: string;
  title: string;
  enabled: boolean;
  models: Model[];
};

export type Configs = {
  providers: Provider[];
  file_types: string[];
};

export type SpaceResponse<T> = {
  space: Space;
  user: User;
  files: T;
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
  role: "user" | "assistant";
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
  confidence: number;
  followUpSuggestions: string[];
  strategy: "comprehensive" | "focused" | "hybrid" | "error";
  reasoning: string | null;
};

export type Context = {
  id: string;
  type: "file" | "space";
  name: string;
};

export type SearchTab = "all" | "documents" | "spaces";

export type AllFiles = File & {
  spaceName: string;
  spaceIcon: string;
};

export type SettingsTab = "profile" | "models" | "integrations";

export type Theme = "dark" | "light" | "system";
