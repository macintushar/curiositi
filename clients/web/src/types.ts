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
  models: Model[];
};

export type ProviderResponse = {
  providers: Provider[];
};

export type SpaceResponse = {
  space: Space;
  user: User;
  files: number;
};

export type Thread = {
  id: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  spaceId: string | null;
};
