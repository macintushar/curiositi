import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChatState = {
	activeConversationId: string | null;
	selectedAgentId: string | null;
	selectedModelId: string | null;
	selectedModelProvider: string | null;
	pendingMessage: string | null;

	setActiveConversation: (id: string | null) => void;
	setSelectedAgentId: (agentId: string | null) => void;
	setSelectedModel: (
		modelId: string | null,
		modelProvider: string | null
	) => void;
	setPendingMessage: (message: string | null) => void;
};

export const useChatStore = create<ChatState>()(
	persist(
		(set) => ({
			activeConversationId: null,
			selectedAgentId: null,
			selectedModelId: null,
			selectedModelProvider: null,
			pendingMessage: null,

			setActiveConversation: (id) => set({ activeConversationId: id }),

			setSelectedAgentId: (agentId) => set({ selectedAgentId: agentId }),

			setSelectedModel: (modelId, modelProvider) =>
				set({ selectedModelId: modelId, selectedModelProvider: modelProvider }),

			setPendingMessage: (message) => set({ pendingMessage: message }),
		}),
		{
			name: "curiositi-chat-storage",
		}
	)
);
