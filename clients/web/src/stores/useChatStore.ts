import type { AllFiles, Context, Model, Configs, Space } from "@/types";
import type { SearchTab } from "@/types";
import { create } from "zustand";

type ActiveModel = {
  provider_name: string;
  model: Model;
};

type ChatStore = {
  prompt: string;
  context: Context[];
  isLoading: boolean;
  search: string;
  tab: SearchTab;
  files: AllFiles[];
  spaces: Space[];
  configs: Configs | null;
  activeModel: ActiveModel | null;
  setPrompt: (prompt: string) => void;
  setContext: (context: Context[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSearch: (search: string) => void;
  setTab: (tab: SearchTab) => void;
  setFiles: (files: AllFiles[]) => void;
  setSpaces: (spaces: Space[]) => void;
  setConfigs: (configs: Configs) => void;
  setActiveModel: (activeModel: ActiveModel) => void;
};

const useChatStore = create<ChatStore>((set) => ({
  prompt: "",
  context: [],
  isLoading: false,
  search: "",
  tab: "all",
  files: [],
  spaces: [],
  configs: null,
  activeModel: null,
  setPrompt: (prompt) => set({ prompt }),
  setContext: (context) => set({ context }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSearch: (search) => set({ search }),
  setTab: (tab) => set({ tab }),
  setFiles: (files) => set({ files }),
  setSpaces: (spaces) => set({ spaces }),
  setConfigs: (configs) => set({ configs }),
  setActiveModel: (activeModel) => set({ activeModel }),
}));

export default useChatStore;
