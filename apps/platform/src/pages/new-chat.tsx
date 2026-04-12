"use client";

import ChatInput from "@platform/components/chat/chat-input";
import { useChatStore } from "@platform/stores/chat-store";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useRouter } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";

export default function NewChat() {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const {
		setPendingMessage,
		setAvailableAgents,
		setSelectedAgentId,
		availableAgents,
		selectedAgentId,
	} = useChatStore();
	const router = useRouter();

	useEffect(() => {
		const loadAgents = async () => {
			const result = await trpcClient.chat.getAvailableAgents.query();
			setAvailableAgents(result.agents as typeof availableAgents);
			if (result.agents.length > 0 && !selectedAgentId) {
				const askAgent = result.agents.find(
					(a: (typeof availableAgents)[number]) => a.id === "system:ask"
				);
				setSelectedAgentId(askAgent?.id ?? result.agents[0]?.id ?? null);
			}
		};
		loadAgents();
	}, [setAvailableAgents, setSelectedAgentId, selectedAgentId]);

	const handleSubmit = useCallback(async () => {
		const text = input.trim();
		if (!text || isLoading) return;

		setIsLoading(true);
		setPendingMessage(text);

		try {
			const result = await trpcClient.chat.createConversation.mutate({
				title: undefined,
			});
			router.navigate({
				to: "/app/chat/$conversationId",
				params: { conversationId: result.conversation.id },
			});
		} finally {
			setIsLoading(false);
		}
	}, [input, isLoading, setPendingMessage, router]);

	return (
		<div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] gap-4 justify-center items-center">
			<div className="h-56 gap-12 flex flex-col justify-center items-center w-full sm:w-3/4">
				<div className="flex flex-col gap-4">
					<h1 className="text-3xl font-bold font-doto text-center">
						~ Hey there! ~
					</h1>
					<p className="text-lg text-center">What are you working on?</p>
				</div>
				<ChatInput
					isLoading={isLoading}
					input={input}
					setInput={setInput}
					onSubmit={handleSubmit}
				/>
			</div>
		</div>
	);
}
