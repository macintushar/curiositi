import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import {
	SidebarGroupLabel,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
} from "../ui/sidebar";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ChatConversations() {
	const [open, setOpen] = useState(true);
	const { data, isLoading } = useQuery({
		queryKey: ["conversations"],
		queryFn: () => trpcClient.chat.getAllConversations.query(),
	});

	const { conversationId } = useParams({ strict: false });

	const conversations = data?.conversations;

	if (isLoading) {
		return (
			<SidebarMenuSub>
				<SidebarMenuSkeleton />
				<SidebarMenuSkeleton />
				<SidebarMenuSkeleton />
			</SidebarMenuSub>
		);
	}

	if (!conversations || conversations.length === 0) {
		return (
			<SidebarMenuSub className="text-sm">
				No conversations found.
			</SidebarMenuSub>
		);
	}

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<CollapsibleTrigger className="flex justify-between items-center w-full">
				<SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
				{open ? (
					<ChevronUp className="size-4 text-muted-foreground" />
				) : (
					<ChevronDown className="size-4 text-muted-foreground" />
				)}
			</CollapsibleTrigger>
			<CollapsibleContent>
				<SidebarMenuSub>
					{conversations.map((conv) => (
						<Link
							key={conv.id}
							to={"/app/chat/$conversationId"}
							params={{ conversationId: conv.id }}
						>
							<SidebarMenuSubButton isActive={conv.id === conversationId}>
								{conv.title ?? "New Chat"}
							</SidebarMenuSubButton>
						</Link>
					))}
				</SidebarMenuSub>
			</CollapsibleContent>
		</Collapsible>
	);
}
