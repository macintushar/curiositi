import type { SettingsTab } from "@/types";
import { create } from "zustand";

type SettingsStore = {
  tab: SettingsTab;
  setTab: (tab: SettingsTab) => void;
};

const useSettingsStore = create<SettingsStore>((set) => ({
  tab: "profile",
  setTab: (tab) => set({ tab }),
}));

export default useSettingsStore;
