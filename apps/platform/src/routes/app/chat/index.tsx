"use client";

import NewChat from "@platform/pages/new-chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/chat/")({
	component: NewChat,
});
