"use client";

import { Folder, Home, Link2, Settings, Search } from "lucide-react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@platform/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@platform/hooks/use-mobile";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { formatFileSize, formatDate } from "@platform/lib/search-utils";
import type { SearchResult } from "@curiositi/api-handlers";
import FileViewerDialog from "./dialogs/file-viewer-dialog";
import { SearchDialog } from "./dialogs/search-dialog";
import { FileTags } from "./file-helpers";
import { useState, useEffect } from "react";
import FileIcon from "./file-icon";
import { SidebarMenuButton, useSidebar } from "./ui/sidebar";

function RecentFiles({ onOpenFile }: { onOpenFile: (fileId: string) => void }) {
	const { data, isLoading } = useQuery({
		queryKey: ["commander", "recent"],
		queryFn: () => trpcClient.file.getRecent.query({ limit: 5 }),
	});

	if (isLoading || !data?.data || data.data.length === 0) return null;

	return (
		<CommandGroup heading="RECENT FILES">
			{data.data.map((result: SearchResult) => (
				<CommandItem
					key={result.file.id}
					value={`recent-${result.file.id}-${result.file.name}`}
					onSelect={() => onOpenFile(result.file.id)}
				>
					<FileIcon type={result.file.type} coloredIcon />
					<div className="flex-1 min-w-0">
						<span className="truncate block">{result.file.name}</span>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span>{formatFileSize(result.file.size)}</span>
							<span>{formatDate(result.file.createdAt)}</span>
							{result.spaceName && (
								<span className="flex items-center gap-1">
									<Folder className="w-3 h-3" />
									{result.spaceName}
								</span>
							)}
						</div>
						<FileTags tags={result.file.tags} />
					</div>
				</CommandItem>
			))}
		</CommandGroup>
	);
}

export default function Commander() {
	const [open, setOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [viewerFileId, setViewerFileId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const { open: sidebarOpen } = useSidebar();

	const COMMANDER_KEYBOARD_SHORTCUT = "k";

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === COMMANDER_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const handleOpenFile = (fileId: string) => {
		setViewerFileId(fileId);
	};

	const handleOpenSearch = (query: string) => {
		setSearchQuery(query);
		setSearchOpen(true);
	};

	return (
		<>
			{isMobile ? (
				<Button onClick={() => setOpen(true)} aria-label="Open search">
					<IconSearch className="size-5" />
				</Button>
			) : (
				<SidebarMenuButton
					className="flex flex-row p-1 px-1.5 items-center justify-between transition-all hover:cursor-pointer"
					onClick={() => setOpen(true)}
				>
					<div className="flex items-center gap-1.5">
						<IconSearch className="size-3.5 dark:text-foreground text-primary" />
						{sidebarOpen && (
							<p className="text-foreground hover:cursor-text">Search</p>
						)}
					</div>
					{sidebarOpen && (
						<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
							<span className="text-2xs">
								{navigator.userAgent.includes("Mac") ? "⌘" : "ctrl"}
							</span>
							+ {COMMANDER_KEYBOARD_SHORTCUT}
						</kbd>
					)}
				</SidebarMenuButton>
			)}
			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				className="min-w-1/2 h-1/2"
				title="search dialog"
			>
				<CommandInput placeholder="Type a command or search..." />
				<CommandList className="w-full h-full max-h-none">
					<CommandEmpty>No results found.</CommandEmpty>
					<RecentFiles onOpenFile={handleOpenFile} />
					<CommandSeparator />
					<CommandGroup heading="SEARCH">
						<CommandItem
							value="search-files"
							onSelect={() => handleOpenSearch("")}
						>
							<Search className="w-4 h-4" />
							<span>Search files...</span>
							<CommandShortcut>Enter</CommandShortcut>
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="QUICK ACTIONS">
						<CommandItem>
							<Link2 />
							<span>Add a link</span>
						</CommandItem>
						<CommandItem>
							<Folder />
							<span>Create a Space</span>
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="NAVIGATION">
						<CommandItem
							onSelect={() => {
								navigate({ to: "/app" });
								setOpen(false);
							}}
						>
							<Home />
							<span>Home</span>
							<CommandShortcut>⌘H</CommandShortcut>
						</CommandItem>
						<CommandItem
							onSelect={() => {
								navigate({ to: "/app" });
								setOpen(false);
							}}
						>
							<Settings />
							<span>Settings</span>
							<CommandShortcut>⌘S</CommandShortcut>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
			<FileViewerDialog
				open={!!viewerFileId}
				onOpenChange={(isOpen) => {
					if (!isOpen) setViewerFileId(null);
				}}
				fileId={viewerFileId}
			/>
			<SearchDialog
				open={searchOpen}
				onOpenChange={setSearchOpen}
				onOpenFile={handleOpenFile}
				initialQuery={searchQuery}
			/>
		</>
	);
}
