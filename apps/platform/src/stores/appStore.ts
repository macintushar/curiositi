import { create } from "zustand";

type SettingsTab =
	| "profile"
	| "workspace"
	| "models"
	| "search"
	| "tools"
	| "agent";

type AppStoreState = {
	isSettingsDialogOpen: boolean;
	settingsDialogInitialTab: SettingsTab | null;
	toggleSettingsDialog: (value: boolean) => void;
	openSettingsToTab: (tab: SettingsTab) => void;
};

const useAppStore = create<AppStoreState>()((set) => ({
	isSettingsDialogOpen: false,
	settingsDialogInitialTab: null,
	toggleSettingsDialog: (value) => set({ isSettingsDialogOpen: value }),
	openSettingsToTab: (tab) =>
		set({ isSettingsDialogOpen: true, settingsDialogInitialTab: tab }),
}));

export default useAppStore;
export type { SettingsTab };
