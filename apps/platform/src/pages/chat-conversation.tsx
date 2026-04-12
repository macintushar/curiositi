import { Copy, RefreshCcw, Trash } from "lucide-react";
import type { UIMessage } from "ai";
import { useEffect } from "react";
import { toast } from "sonner";

import {
	ChatContainerRoot,
	ChatContainerContent,
} from "@platform/components/ui/chat-container";
import {
	Message,
	MessageContent,
	MessageActions,
	MessageAction,
} from "@platform/components/ui/message";
import ChatInput from "@platform/components/chat/chat-input";
import { useChatStore } from "@platform/stores/chat-store";
import { Button } from "@platform/components/ui/button";
import { useChat } from "@platform/hooks/use-chat";
import { cn } from "@platform/lib/utils";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";

function getMessageText(message: UIMessage): string {
	const textPart = message.parts.find((p) => p.type === "text");
	return textPart?.text ?? "";
}

export default function ChatConversation({
	conversationId,
}: {
	conversationId: string;
}) {
	const {
		messages,
		input,
		setInput,
		handleSubmit,
		isLoading,
		error,
		regenerate,
		sendMessage,
		status,
	} = useChat({ conversationId });

	const {
		pendingMessage,
		setPendingMessage,
		setAvailableAgents,
		setSelectedAgentId,
		availableAgents,
		selectedAgentId,
	} = useChatStore();

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

	useEffect(() => {
		if (
			pendingMessage &&
			status === "ready" &&
			messages.length === 0 &&
			selectedAgentId
		) {
			sendMessage({ text: pendingMessage });
			setPendingMessage(null);
		}
	}, [
		pendingMessage,
		status,
		messages.length,
		sendMessage,
		setPendingMessage,
		selectedAgentId,
	]);

	const onSubmit = () => {
		handleSubmit();
	};

	return (
		<div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)] max-h gap-4">
			<div className="flex flex-1 flex-col min-w-0">
				<ChatContainerRoot className="relative flex-1 overflow-y-auto">
					<ChatContainerContent className="space-y-2 px-4 py-12">
						{messages.length === 0 && !isLoading && (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<h3 className="text-lg font-medium mb-2">
										Start a conversation
									</h3>
									<p className="text-sm text-muted-foreground">
										Type a message below to begin chatting with your AI
										assistant
									</p>
								</div>
							</div>
						)}

						{messages.map((message, index) => {
							const isUser = message.role === "user";
							const isLastMessage = index === messages.length - 1;
							const messageText = getMessageText(message);

							if (messageText === "" && message.role === "assistant") {
								return null;
							}

							return (
								<Message
									key={message.id}
									className={cn(
										"mx-auto flex w-full max-w-3xl flex-col gap-2 px-0 md:px-6",
										isUser ? "items-end" : "items-start"
									)}
								>
									{isUser ? (
										<div className="group flex flex-col w-full items-end gap-1">
											<MessageContent className="bg-background dark:bg-muted max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]">
												{messageText}
											</MessageContent>
											<MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
												<MessageAction tooltip="Delete" delayDuration={100}>
													<Button
														variant="ghost"
														size="icon"
														className="rounded-full"
													>
														<Trash className="h-4 w-4" />
													</Button>
												</MessageAction>
												<MessageAction tooltip="Copy" delayDuration={100}>
													<Button
														variant="ghost"
														size="icon"
														className="rounded-full"
														onClick={() => {
															try {
																navigator.clipboard.writeText(messageText);
															} catch (_e) {
																toast.error("Failed to copy text");
															}
														}}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</MessageAction>
											</MessageActions>
										</div>
									) : (
										<div className="group flex flex-col w-full gap-0">
											<MessageContent
												className="bg-transparent dark:prose-invert"
												markdown
											>
												{messageText}
											</MessageContent>
											<MessageActions
												className={cn(
													"flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
													isLastMessage && "opacity-100"
												)}
											>
												<MessageAction tooltip="Copy" delayDuration={100}>
													<Button
														variant="ghost"
														size="icon"
														className="rounded-full"
														onClick={() =>
															navigator.clipboard.writeText(messageText)
														}
													>
														<Copy className="h-4 w-4" />
													</Button>
												</MessageAction>
												<MessageAction tooltip="Regenerate" delayDuration={100}>
													<Button
														variant="ghost"
														size="icon"
														className="rounded-full"
														onClick={() => regenerate()}
													>
														<RefreshCcw className="h-4 w-4" />
													</Button>
												</MessageAction>
											</MessageActions>
										</div>
									)}
								</Message>
							);
						})}
						{isLoading && messages[messages.length - 1]?.role === "user" && (
							<Message className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-0 md:px-6 items-start">
								<div className="group flex w-full flex-col gap-0">
									<MessageContent className="text-foreground prose w-full flex-1 rounded-lg bg-transparent p-0">
										<span className="animate-pulse">Thinking...</span>
									</MessageContent>
								</div>
							</Message>
						)}
						{error && (
							<div className="mx-auto max-w-3xl p-4 bg-destructive/10 text-destructive rounded-lg">
								<p className="text-sm">
									Error: {error.message ?? "Something went wrong"}
								</p>
							</div>
						)}
					</ChatContainerContent>
				</ChatContainerRoot>

				<div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 md:px-5 md:pb-5">
					<ChatInput
						isLoading={isLoading}
						input={input}
						setInput={setInput}
						onSubmit={onSubmit}
					/>
				</div>
			</div>
		</div>
	);
}
