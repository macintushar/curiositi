import { create } from "zustand";

type AppStoreState = {
	isSettingsDialogOpen: boolean;
	toggleSettingsDialog: (value: boolean) => void;
};

const useAppStore = create<AppStoreState>()((set) => ({
	isSettingsDialogOpen: false,
	toggleSettingsDialog: (value) => set({ isSettingsDialogOpen: value }),
}));

export default useAppStore;
