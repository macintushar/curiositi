"use client";

import ChatConversation from "@platform/pages/chat-conversation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/chat/$conversationId")({
	component: ChatConversationPage,
});

function ChatConversationPage() {
	const { conversationId } = Route.useParams();
	return (
		<ChatConversation key={conversationId} conversationId={conversationId} />
	);
}
