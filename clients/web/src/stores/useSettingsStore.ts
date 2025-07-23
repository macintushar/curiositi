import type { SettingsTab } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStore = {
  tab: SettingsTab;
  setTab: (tab: SettingsTab) => void;
};

const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      tab: "profile",
      setTab: (tab) => set({ tab }),
    }),
    {
      name: "curiositi-settings-store",
    },
  ),
);

export default useSettingsStore;
