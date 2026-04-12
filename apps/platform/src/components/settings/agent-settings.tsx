"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useChatStore } from "@platform/stores/chat-store";
import SettingsLayout, { ActionCard, LayoutHead } from "./settings-layout";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "../ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { Plus, Pencil, Trash2, Check, Loader2, Shield } from "lucide-react";
import { cn } from "@platform/lib/utils";
import { toast } from "sonner";

type AgentRow = {
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
	toolCount: number;
};

type ToolRow = {
	id: string;
	name: string;
	displayName: string;
	description: string;
	type: string;
	organizationId: string;
	isActive: boolean;
};

type AgentToolLink = {
	id: string;
	agentId: string;
	toolId: string;
	enabled: boolean;
	priority: number;
	config: Record<string, unknown>;
	tool: ToolRow | null;
};

export default function AgentSettings() {
	const [agents, setAgents] = useState<AgentRow[]>([]);
	const [tools, setTools] = useState<ToolRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [editorOpen, setEditorOpen] = useState(false);
	const [editingAgent, setEditingAgent] = useState<AgentRow | null>(null);
	const [saving, setSaving] = useState(false);
	const [toolsLoading, setToolsLoading] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<AgentRow | null>(null);

	const [formName, setFormName] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formSystemPrompt, setFormSystemPrompt] = useState("");
	const [formMaxToolCalls, setFormMaxToolCalls] = useState(10);
	const [formToolIds, setFormToolIds] = useState<string[]>([]);

	const { setAvailableAgents } = useChatStore();

	const loadData = useCallback(async () => {
		try {
			const [agentsResult, toolsResult] = await Promise.all([
				trpcClient.agent.getAll.query(),
				trpcClient.agent.getAvailableTools.query(),
			]);
			setAgents(agentsResult.agents as AgentRow[]);
			setTools(toolsResult.tools as ToolRow[]);
			setAvailableAgents(agentsResult.agents as AgentRow[]);
		} catch (_err) {
			toast.error("Failed to load agents");
		} finally {
			setLoading(false);
		}
	}, [setAvailableAgents]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	function openCreateDialog() {
		setEditingAgent(null);
		setFormName("");
		setFormDescription("");
		setFormSystemPrompt("");
		setFormMaxToolCalls(10);
		setFormToolIds([]);
		setEditorOpen(true);
	}

	function openEditDialog(agent: AgentRow) {
		if (agent.id.startsWith("system:")) {
			toast.info("System agents cannot be modified");
			return;
		}
		setEditingAgent(agent);
		setFormName(agent.name);
		setFormDescription(agent.description ?? "");
		setFormSystemPrompt(agent.systemPrompt);
		setFormMaxToolCalls(agent.maxToolCalls);
		setEditorOpen(true);
		loadAgentTools(agent.id);
	}

	async function loadAgentTools(agentId: string) {
		setToolsLoading(true);
		try {
			const result = await trpcClient.agent.getTools.query({ agentId });
			const linkedToolIds = (result.tools as AgentToolLink[])
				.filter((t) => t.enabled)
				.map((t) => t.toolId);
			setFormToolIds(linkedToolIds);
		} catch {
			toast.error("Failed to load agent tools");
			setFormToolIds([]);
		} finally {
			setToolsLoading(false);
		}
	}

	async function handleSave() {
		if (!formName.trim() || !formSystemPrompt.trim()) {
			toast.error("Name and system prompt are required");
			return;
		}

		setSaving(true);
		try {
			if (editingAgent) {
				await trpcClient.agent.update.mutate({
					agentId: editingAgent.id,
					name: formName,
					description: formDescription || undefined,
					systemPrompt: formSystemPrompt,
					maxToolCalls: formMaxToolCalls,
					toolIds: formToolIds,
				});
				toast.success("Agent updated");
			} else {
				await trpcClient.agent.create.mutate({
					name: formName,
					description: formDescription || undefined,
					systemPrompt: formSystemPrompt,
					maxToolCalls: formMaxToolCalls,
					toolIds: formToolIds,
				});
				toast.success("Agent created");
			}
			setEditorOpen(false);
			await loadData();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to save agent");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(agent: AgentRow) {
		if (agent.id.startsWith("system:")) {
			toast.error("Cannot delete system agents");
			return;
		}
		if (agent.isDefault) {
			toast.error("Cannot delete default agent");
			return;
		}
		setDeleteTarget(agent);
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		try {
			await trpcClient.agent.delete.mutate({ agentId: deleteTarget.id });
			toast.success("Agent deleted");
			setDeleteTarget(null);
			await loadData();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to delete agent"
			);
		}
	}

	function toggleTool(toolId: string) {
		setFormToolIds((prev) =>
			prev.includes(toolId)
				? prev.filter((id) => id !== toolId)
				: [...prev, toolId]
		);
	}

	const toolCountByAgent = useMemo(() => {
		const counts: Record<string, number> = {};
		for (const agent of agents) {
			counts[agent.id] = agent.toolCount;
		}
		return counts;
	}, [agents]);

	if (loading) {
		return (
			<SettingsLayout
				title="Agents"
				description="Manage your organization's agents."
			>
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-6 h-6 animate-spin" />
				</div>
			</SettingsLayout>
		);
	}

	return (
		<SettingsLayout
			title="Agents"
			description="Manage your organization's agents."
		>
			<ActionCard>
				<div className="flex items-center justify-between">
					<LayoutHead
						title="Agents"
						description={`${agents.length} agent${agents.length !== 1 ? "s" : ""} configured`}
					/>
					<Button onClick={openCreateDialog} size="sm">
						<Plus className="size-4" />
						Create agent
					</Button>
				</div>
			</ActionCard>

			<ActionCard>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Tools</TableHead>
							<TableHead>Max Tool Calls</TableHead>
							<TableHead className="w-24">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{agents.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground py-8"
								>
									No agents yet. Create one to get started.
								</TableCell>
							</TableRow>
						) : (
							agents.map((agent) => (
								<TableRow key={agent.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<span className="font-medium">{agent.name}</span>
											{agent.id.startsWith("system:") && (
												<Badge variant="outline" className="text-xs">
													<Shield className="size-3 mr-1" />
													System
												</Badge>
											)}
											{agent.isDefault && !agent.id.startsWith("system:") && (
												<Badge variant="secondary" className="text-xs">
													Default
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className="max-w-xs truncate text-muted-foreground">
										{agent.description ?? "—"}
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{toolCountByAgent[agent.id] ?? 0}
										</Badge>
									</TableCell>
									<TableCell>{agent.maxToolCalls}</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												disabled={agent.id.startsWith("system:")}
												onClick={() => openEditDialog(agent)}
												aria-label={`Edit ${agent.name}`}
											>
												<Pencil className="size-4" aria-hidden="true" />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												disabled={
													agent.id.startsWith("system:") || agent.isDefault
												}
												onClick={() => handleDelete(agent)}
												aria-label={`Delete ${agent.name}`}
											>
												<Trash2 className="size-4" aria-hidden="true" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</ActionCard>

			<Dialog open={editorOpen} onOpenChange={setEditorOpen}>
				<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingAgent ? "Edit Agent" : "Create Agent"}
						</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-4 py-4">
						<div className="flex flex-col gap-2">
							<label htmlFor="agent-name" className="text-sm font-medium">
								Name <span className="text-destructive">*</span>
							</label>
							<Input
								id="agent-name"
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
								placeholder="e.g. Research Assistant"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="agent-description"
								className="text-sm font-medium"
							>
								Description
							</label>
							<Input
								id="agent-description"
								value={formDescription}
								onChange={(e) => setFormDescription(e.target.value)}
								placeholder="Short description of what this agent does"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="agent-system-prompt"
								className="text-sm font-medium"
							>
								System Prompt <span className="text-destructive">*</span>
							</label>
							<Textarea
								id="agent-system-prompt"
								value={formSystemPrompt}
								onChange={(e) => setFormSystemPrompt(e.target.value)}
								placeholder="Instructions that guide the agent's behavior..."
								rows={6}
								className="font-mono text-sm"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="agent-max-tool-calls"
								className="text-sm font-medium"
							>
								Max Tool Calls
							</label>
							<Input
								id="agent-max-tool-calls"
								type="number"
								value={formMaxToolCalls}
								onChange={(e) => setFormMaxToolCalls(Number(e.target.value))}
								min={1}
								max={200}
								className="w-32"
							/>
							<p className="text-xs text-muted-foreground">
								Maximum number of tool calls the agent can make in a single
								conversation turn.
							</p>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="agent-tools-search"
								className="text-sm font-medium"
							>
								Tools
							</label>
							{toolsLoading ? (
								<div className="flex items-center justify-center py-6 border rounded-lg">
									<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
								</div>
							) : (
								<Command className="border rounded-lg">
									<CommandInput
										id="agent-tools-search"
										placeholder="Search tools..."
									/>
									<CommandList>
										<CommandEmpty>No tools found.</CommandEmpty>
										<CommandGroup>
											{tools.map((tool) => {
												const selected = formToolIds.includes(tool.id);
												return (
													<CommandItem
														key={tool.id}
														onSelect={() => toggleTool(tool.id)}
														className="flex items-center gap-2 cursor-pointer"
													>
														<div
															className={cn(
																"flex size-4 items-center justify-center rounded-sm border",
																selected
																	? "bg-primary text-primary-foreground border-primary"
																	: "border-muted-foreground"
															)}
														>
															{selected && <Check className="size-3" />}
														</div>
														<div className="flex-1">
															<div className="text-sm font-medium">
																{tool.displayName}
															</div>
															<div className="text-xs text-muted-foreground truncate">
																{tool.description}
															</div>
														</div>
													</CommandItem>
												);
											})}
										</CommandGroup>
									</CommandList>
								</Command>
							)}
							<p className="text-xs text-muted-foreground">
								Select tools this agent has access to.
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditorOpen(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={saving || toolsLoading}>
							{saving && <Loader2 className="size-4 animate-spin" />}
							{editingAgent ? "Update" : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Agent</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete{" "}
							<span className="font-medium">{deleteTarget?.name}</span>? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteTarget(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</SettingsLayout>
	);
}
