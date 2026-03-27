"use client";

import ChatInput from "@platform/components/chat/chat-input";
import { useChatStore } from "@platform/stores/chat-store";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useRouter } from "@tanstack/react-router";
import { useState, useCallback } from "react";

export default function NewChat() {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { setPendingMessage, selectedAgentId } = useChatStore();
	const router = useRouter();

	const handleSubmit = useCallback(async () => {
		const text = input.trim();
		if (!text || isLoading) return;

		setIsLoading(true);
		setPendingMessage(text);

		try {
			const result = await trpcClient.chat.createConversation.mutate({
				title: undefined,
				agentId: selectedAgentId || undefined,
			});
			router.navigate({
				to: "/app/chat/$conversationId",
				params: { conversationId: result.conversation.id },
			});
		} finally {
			setIsLoading(false);
		}
	}, [input, isLoading, selectedAgentId, setPendingMessage, router]);

	return (
		<div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] max-h gap-4 justify-center items-center">
			<div className="h-56 space-y-12 w-full sm:w-3/4 flex flex-col">
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
