import type { AllFiles, Context, Model, Configs, Space } from "@/types";
import type { SearchTab } from "@/types";

import { persist } from "zustand/middleware";
import { create } from "zustand";

type ActiveModel = {
  provider_name: string;
  model: Model;
};

type ChatStore = {
  prompt: string;
  context: Context[];
  isLoading: boolean;
  isStreaming: boolean;
  search: string;
  tab: SearchTab;
  files: AllFiles[];
  spaces: Space[];
  configs: Configs | null;
  activeModel: ActiveModel | null;
  setPrompt: (prompt: string) => void;
  setContext: (context: Context[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setSearch: (search: string) => void;
  setTab: (tab: SearchTab) => void;
  setFiles: (files: AllFiles[]) => void;
  setSpaces: (spaces: Space[]) => void;
  setConfigs: (configs: Configs) => void;
  setActiveModel: (activeModel: ActiveModel) => void;
};

const useChatStore = create(
  persist<ChatStore>(
    (set) => ({
      prompt: "",
      context: [],
      isLoading: false,
      isStreaming: false,
      search: "",
      tab: "all",
      files: [],
      spaces: [],
      configs: null,
      activeModel: null,
      setPrompt: (prompt) => set({ prompt }),
      setContext: (context) => set({ context }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      setSearch: (search) => set({ search }),
      setTab: (tab) => set({ tab }),
      setFiles: (files) => set({ files }),
      setSpaces: (spaces) => set({ spaces }),
      setConfigs: (configs) => set({ configs }),
      setActiveModel: (activeModel) => set({ activeModel }),
    }),
    {
      name: "curiositi-chat-store",
    },
  ),
);

export default useChatStore;
