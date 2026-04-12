"use client";

import { useChat as useAiChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChatStore } from "@platform/stores/chat-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";

type UseChatOptions = {
	conversationId: string;
};

function createUIMessageFromText(
	id: string,
	role: "user" | "assistant" | "system",
	content: string
): UIMessage {
	return {
		id: id,
		role,
		parts: [{ type: "text", text: content }],
	};
}

export function useChat(options: UseChatOptions) {
	const {
		selectedAgentId,
		selectedModelId,
		selectedModelProvider,
		searchProvider,
		webSearchEnabled,
		fileSearchEnabled,
		files,
	} = useChatStore();

	const conversationId = options.conversationId;
	const agentId = selectedAgentId ?? undefined;
	const modelId = selectedModelId ?? undefined;
	const modelProvider = selectedModelProvider ?? undefined;

	const [input, setInput] = useState("");

	const transport = useMemo(() => {
		if (!conversationId) return undefined;
		return new DefaultChatTransport({
			api: `/api/chat/${conversationId}`,
			body: {
				...(agentId && { agentId }),
				...(modelId && { modelId }),
				...(modelProvider && { modelProvider }),
				...(searchProvider && { searchProvider }),
				webSearchEnabled,
				fileSearchEnabled,
				...(files.length > 0 && { fileIds: files.map((f) => f.id) }),
			},
		});
	}, [
		conversationId,
		agentId,
		modelId,
		modelProvider,
		searchProvider,
		webSearchEnabled,
		fileSearchEnabled,
		files,
	]);

	const {
		messages,
		sendMessage,
		status,
		error,
		stop,
		setMessages,
		regenerate,
	} = useAiChat({
		transport,
	});

	const { data: existingMessages } = useQuery({
		queryKey: ["messages", conversationId],
		queryFn: () => trpcClient.chat.getMessages.query({ conversationId }),
		enabled: !!conversationId,
	});

	useEffect(() => {
		if (existingMessages?.messages && messages.length === 0) {
			const historicalMessages = existingMessages.messages.map((m) =>
				createUIMessageFromText(
					m.id,
					m.role as "user" | "assistant" | "system",
					m.content
				)
			);
			setMessages(historicalMessages);
		}
	}, [existingMessages, messages.length, setMessages]);

	const isLoading = status === "streaming" || status === "submitted";

	const createNewConversation = useCallback(async () => {
		const result = await trpcClient.chat.createConversation.mutate({
			title: undefined,
		});
		return result.conversation.id;
	}, []);

	const handleSubmit = useCallback(
		(e?: React.SubmitEvent) => {
			e?.preventDefault?.();
			if (!input.trim() || isLoading) return;

			const text = input.trim();
			setInput("");
			sendMessage({ text });
		},
		[input, sendMessage, isLoading]
	);

	return {
		messages,
		input,
		setInput,
		handleSubmit,
		isLoading,
		error,
		createNewConversation,
		stop,
		conversationId,
		regenerate,
		sendMessage,
		status,
	};
}
