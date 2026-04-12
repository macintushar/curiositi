import SettingsLayout, { ActionCard, LayoutHead } from "./settings-layout";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { Plus, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ServerRow = {
	id: string;
	name: string;
	url: string;
	isActive: boolean;
	discoveredTools: number | null;
	lastConnectedAt: Date | null;
};

export default function ToolsSettings() {
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<ServerRow | null>(null);
	const [newServer, setNewServer] = useState({
		name: "",
		url: "",
		headers: "",
	});

	const { data: builtInData } = useQuery({
		queryKey: ["tools", "listBuiltIn"],
		queryFn: () => trpcClient.tools.listBuiltIn.query(),
	});
	const tools = builtInData?.tools ?? [];

	const { data: serversData } = useQuery({
		queryKey: ["tools", "list"],
		queryFn: () => trpcClient.tools.list.query(),
	});
	const servers = serversData?.servers ?? [];

	const createServer = useMutation({
		mutationFn: (input: {
			name: string;
			url: string;
			headers?: Record<string, string>;
		}) => trpcClient.tools.create.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
			setNewServer({ name: "", url: "", headers: "" });
			setDialogOpen(false);
		},
	});

	const updateServer = useMutation({
		mutationFn: (input: { id: string; isActive: boolean }) =>
			trpcClient.tools.update.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
		},
	});

	const deleteServer = useMutation({
		mutationFn: (input: { id: string }) =>
			trpcClient.tools.delete.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools", "list"] });
		},
	});

	const toggleBuiltIn = useMutation({
		mutationFn: (input: { id: string; isActive: boolean }) =>
			trpcClient.tools.toggleBuiltIn.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tools", "listBuiltIn"] });
		},
	});

	const handleAddServer = () => {
		if (!newServer.name || !newServer.url) return;
		let headers: Record<string, string> | undefined;
		if (newServer.headers.trim()) {
			try {
				headers = JSON.parse(newServer.headers);
			} catch {
				return;
			}
		}
		createServer.mutate({
			name: newServer.name,
			url: newServer.url,
			headers,
		});
	};

	const handleToggleServer = (id: string, isActive: boolean) => {
		updateServer.mutate({ id, isActive });
	};

	const handleRemoveServer = (server: ServerRow) => {
		setDeleteTarget(server);
	};

	const confirmRemoveServer = () => {
		if (!deleteTarget) return;
		deleteServer.mutate({ id: deleteTarget.id });
		setDeleteTarget(null);
	};

	return (
		<>
			<SettingsLayout
				title="Tools"
				description="Manage available tools and MCP server connections."
			>
				<ActionCard>
					<LayoutHead
						title="Built-in Tools"
						description="Enable or disable built-in tools."
					/>
					<div className="space-y-3 mt-2">
						{tools.map((tool) => (
							<div
								key={tool.id}
								className="flex items-center justify-between p-4 rounded-lg border"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="font-medium">{tool.displayName}</span>
										<Badge variant="secondary">builtin</Badge>
									</div>
									<p className="text-sm text-muted-foreground mt-1">
										{tool.description}
									</p>
								</div>
								<Switch
									checked={tool.isActive}
									onCheckedChange={(checked) =>
										toggleBuiltIn.mutate({ id: tool.id, isActive: checked })
									}
								/>
							</div>
						))}
					</div>
				</ActionCard>

				<ActionCard>
					<div className="flex items-center justify-between">
						<LayoutHead
							title="MCP Servers"
							description="Connect to external MCP servers to discover additional tools."
						/>
						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogTrigger asChild>
								<Button size="sm">
									<Plus className="w-4 h-4 mr-2" />
									Add Server
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add MCP Server</DialogTitle>
									<DialogDescription>
										Enter the URL of the MCP server to connect to.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div>
										<label
											htmlFor="server-name"
											className="text-sm font-medium"
										>
											Server Name
										</label>
										<Input
											id="server-name"
											placeholder="GitHub Tools"
											value={newServer.name}
											onChange={(e) =>
												setNewServer((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											className="mt-1"
										/>
									</div>
									<div>
										<label htmlFor="server-url" className="text-sm font-medium">
											Server URL
										</label>
										<Input
											id="server-url"
											placeholder="https://mcp.example.com/sse"
											value={newServer.url}
											onChange={(e) =>
												setNewServer((prev) => ({
													...prev,
													url: e.target.value,
												}))
											}
											className="mt-1"
										/>
										<p className="text-xs text-muted-foreground mt-1">
											SSE or Streamable HTTP endpoint.
										</p>
									</div>
									<div>
										<label
											htmlFor="server-headers"
											className="text-sm font-medium"
										>
											Headers (JSON)
										</label>
										<Textarea
											id="server-headers"
											placeholder='{"Authorization": "Bearer token"}'
											value={newServer.headers}
											onChange={(e) =>
												setNewServer((prev) => ({
													...prev,
													headers: e.target.value,
												}))
											}
											className="mt-1"
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Headers are stored in the database. Avoid using long-lived
											secrets where possible.
										</p>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleAddServer}>Add Server</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</ActionCard>

				{servers.length === 0 ? (
					<ActionCard>
						<div className="py-8 text-center">
							<p className="text-muted-foreground">
								No MCP servers connected. Add one to discover external tools.
							</p>
						</div>
					</ActionCard>
				) : (
					<div className="space-y-3 mt-2">
						{servers.map((server) => (
							<div
								key={server.id}
								className="flex items-center justify-between p-4 rounded-lg border"
							>
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<span className="font-medium">{server.name}</span>
										{server.isActive ? (
											<Badge variant="default" className="gap-1">
												<CheckCircle className="w-3 h-3" />
												Connected
											</Badge>
										) : (
											<Badge variant="destructive" className="gap-1">
												<XCircle className="w-3 h-3" />
												Disconnected
											</Badge>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
										<ExternalLink className="w-3 h-3" />
										{server.url}
									</p>
									<div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
										<span>{server.discoveredTools} tools discovered</span>
										{server.lastConnectedAt && (
											<span>
												Last connected:{" "}
												{server.lastConnectedAt.toLocaleString()}
											</span>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Switch
										checked={server.isActive}
										onCheckedChange={(checked) =>
											handleToggleServer(server.id, checked)
										}
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveServer(server as ServerRow)}
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</SettingsLayout>

			<Dialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remove MCP Server</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove{" "}
							<span className="font-medium">{deleteTarget?.name}</span>? All
							discovered tools from this server will be unlinked.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteTarget(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmRemoveServer}>
							Remove
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
