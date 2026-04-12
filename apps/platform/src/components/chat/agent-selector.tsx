"use client";

import { useState, useMemo } from "react";
import { cn } from "@platform/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import {
	IconChevronDown,
	IconChevronUp,
	IconSearch,
	IconSettings,
} from "@tabler/icons-react";
import { useChatStore, type Agent } from "@platform/stores/chat-store";
import useAppStore from "@platform/stores/appStore";
import { isSystemAgentId } from "@curiositi/share/types";

type AgentSelectorProps = {
	onOpenSettings?: () => void;
};

export default function AgentSelector({ onOpenSettings }: AgentSelectorProps) {
	const { selectedAgentId, setSelectedAgentId, availableAgents } =
		useChatStore();
	const { openSettingsToTab } = useAppStore();
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredAgents = useMemo(() => {
		if (!searchQuery.trim()) return availableAgents;
		const query = searchQuery.toLowerCase();
		return availableAgents.filter(
			(agent) =>
				agent.name.toLowerCase().includes(query) ||
				(agent.description?.toLowerCase().includes(query) ?? false)
		);
	}, [availableAgents, searchQuery]);

	const selectedAgent = useMemo(() => {
		if (!selectedAgentId) return null;
		return availableAgents.find((a) => a.id === selectedAgentId);
	}, [availableAgents, selectedAgentId]);

	const handleSelect = (agent: Agent) => {
		setSelectedAgentId(agent.id);
		setOpen(false);
	};

	const handleOpenSettings = () => {
		setOpen(false);
		if (onOpenSettings) {
			onOpenSettings();
		} else {
			openSettingsToTab("agent");
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="gap-2 h-9 px-3 font-normal border-0"
				>
					<span className="text-sm truncate max-w-32">
						{selectedAgent?.name ?? "Select agent"}
					</span>
					{open ? (
						<IconChevronUp className="w-4 h-4 ml-1 shrink-0" />
					) : (
						<IconChevronDown className="w-4 h-4 ml-1 shrink-0" />
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="p-0 w-80"
				align="start"
				alignOffset={-24}
				sideOffset={8}
			>
				<div className="p-3">
					<div className="relative">
						<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search agents..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							className="pl-9 pr-9 h-9 text-sm"
						/>
					</div>
				</div>

				<div className="overflow-y-auto max-h-64 p-2 space-y-1">
					{filteredAgents.length === 0 ? (
						<div className="py-8 text-center text-sm text-muted-foreground">
							No agents found
						</div>
					) : (
						filteredAgents.map((agent) => (
							<Button
								key={agent.id}
								type="button"
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									handleSelect(agent);
								}}
								className={cn(
									"group w-full h-auto text-left p-3 rounded-xl transition-all duration-200 cursor-pointer justify-start",
									selectedAgentId === agent.id
										? "bg-muted"
										: "hover:bg-muted/50"
								)}
							>
								<div className="flex items-start gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm truncate">
												{agent.name}
											</span>
											{isSystemAgentId(agent.id) && (
												<span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
													System
												</span>
											)}
											{agent.isDefault && !isSystemAgentId(agent.id) && (
												<span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
													Default
												</span>
											)}
										</div>
										{agent.description && (
											<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
												{agent.description}
											</p>
										)}
										<p className="text-xs text-muted-foreground mt-1">
											{agent.maxToolCalls} max tool calls
										</p>
									</div>
								</div>
							</Button>
						))
					)}
				</div>

				<div className="border-t p-2">
					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-start gap-2 text-sm"
						onClick={(e) => {
							e.stopPropagation();
							handleOpenSettings();
						}}
					>
						<IconSettings className="w-4 h-4" />
						Manage agents
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
