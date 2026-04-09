import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CtxFile = {
	id: string;
	name: string;
	type: string;
};

export type SearchProvider = "firecrawl" | "exa" | "webfetch";

export type Agent = {
	id: string;
	name: string;
	description: string | null;
	systemPrompt: string;
	maxToolCalls: number;
	isDefault: boolean;
	isActive: boolean;
	organizationId: string;
	createdById: string | null;
	createdAt: Date;
	updatedAt: Date | null;
};

type ChatState = {
	activeConversationId: string | null;
	selectedAgentId: string | null;
	selectedModelId: string | null;
	selectedModelProvider: string | null;
	pendingMessage: string | null;
	files: CtxFile[];
	searchProvider: SearchProvider | null;
	webSearchEnabled: boolean;
	fileSearchEnabled: boolean;
	availableAgents: Agent[];
	setActiveConversation: (id: string | null) => void;
	setSelectedAgentId: (agentId: string | null) => void;
	setSelectedModel: (
		modelId: string | null,
		modelProvider: string | null
	) => void;
	setPendingMessage: (message: string | null) => void;
	addFile: (file: CtxFile) => void;
	removeFile: (fileId: string) => void;
	setSearchProvider: (provider: SearchProvider | null) => void;
	setWebSearchEnabled: (enabled: boolean) => void;
	setFileSearchEnabled: (enabled: boolean) => void;
	setAvailableAgents: (agents: Agent[]) => void;
};

export const useChatStore = create<ChatState>()(
	persist(
		(set) => ({
			activeConversationId: null,
			selectedAgentId: null,
			selectedModelId: null,
			selectedModelProvider: null,
			pendingMessage: null,
			files: [],
			searchProvider: null,
			webSearchEnabled: true,
			fileSearchEnabled: true,
			availableAgents: [],

			setActiveConversation: (id) => set({ activeConversationId: id }),

			setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),

			setSelectedModel: (modelId, modelProvider) =>
				set({ selectedModelId: modelId, selectedModelProvider: modelProvider }),

			setPendingMessage: (message) => set({ pendingMessage: message }),

			addFile: (file) => set((state) => ({ files: [...state.files, file] })),

			removeFile: (fileId) =>
				set((state) => ({ files: state.files.filter((f) => f.id !== fileId) })),

			setSearchProvider: (provider) => set({ searchProvider: provider }),

			setWebSearchEnabled: (enabled) => set({ webSearchEnabled: enabled }),

			setFileSearchEnabled: (enabled) => set({ fileSearchEnabled: enabled }),

			setAvailableAgents: (agents) => set({ availableAgents: agents }),
		}),
		{
			name: "curiositi-chat-storage",
		}
	)
);
