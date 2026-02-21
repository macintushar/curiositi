"use client";

import { Folder, Home, Link2, Settings, Loader2 } from "lucide-react";

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
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "@platform/components/ui/drawer";
import { useNavigate } from "@tanstack/react-router";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@platform/hooks/use-mobile";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { Button } from "./ui/button";
import {
	formatFileSize,
	formatDate,
	getFileTypeLabel,
} from "@platform/lib/search-utils";
import type { SearchResult } from "@curiositi/api-handlers";
import FileViewerDialog from "./dialogs/file-viewer-dialog";
import { FileTags, useDebounce } from "./file-helpers";
import { useState, useEffect } from "react";
import FileIcon from "./file-icon";
import { SidebarMenuButton, useSidebar } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

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

function SearchResults({
	query,
	onOpenFile,
	onClose,
}: {
	query: string;
	onOpenFile: (fileId: string) => void;
	onClose: () => void;
}) {
	const debouncedQuery = useDebounce(query, 500);
	const shouldSearch = debouncedQuery.length >= 2;

	const searchResults = useQuery({
		queryKey: ["commander", "search", debouncedQuery],
		queryFn: () =>
			trpcClient.file.search.query({
				query: debouncedQuery,
				limit: 15,
			}),
		enabled: shouldSearch,
	});

	if (query.length === 0) return null;

	if (!shouldSearch) {
		return (
			<div className="p-8 text-center text-muted-foreground text-sm">
				Type at least 2 characters to search
			</div>
		);
	}

	const isLoading = searchResults.isLoading || searchResults.isFetching;

	if (isLoading && !searchResults.data) {
		return (
			<div className="p-4 space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	const results = searchResults.data?.data || [];

	if (results.length === 0) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				No files found for "{debouncedQuery}"
			</div>
		);
	}

	return (
		<>
			<CommandGroup heading="SEARCH RESULTS">
				{results.map((result: SearchResult) => {
					const isAIMatch = result.matchType === "content";
					return (
						<CommandItem
							key={result.file.id}
							value={`search-${result.file.id}-${result.file.name}`}
							onSelect={() => {
								onOpenFile(result.file.id);
								onClose();
							}}
							className="py-3"
						>
							<div className="shrink-0 size-10 rounded-lg bg-muted flex items-center justify-center mr-3">
								<FileIcon
									type={result.file.type}
									className="w-5 h-5"
									coloredIcon
								/>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-medium truncate">
										{result.file.name}
									</span>
									{isAIMatch && (
										<>
											<IconSparkles className="h-4 w-4 text-yellow-500 shrink-0" />
											<Badge variant="secondary" className="shrink-0 text-xs">
												AI match
											</Badge>
										</>
									)}
								</div>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
									<span>{getFileTypeLabel(result.file.type)}</span>
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
					);
				})}
			</CommandGroup>
			{isLoading && (
				<div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span className="text-sm">AI searching...</span>
				</div>
			)}
		</>
	);
}

function CommanderContent({
	inputValue,
	setInputValue,
	onOpenFile,
	onClose,
	navigate,
}: {
	inputValue: string;
	setInputValue: (v: string) => void;
	onOpenFile: (fileId: string) => void;
	onClose: () => void;
	navigate: (opts: { to: string }) => void;
}) {
	const isSearching = inputValue.length > 0;

	return (
		<>
			<CommandInput
				placeholder="Search files by name, content, or concept..."
				value={inputValue}
				onValueChange={setInputValue}
			/>
			<CommandList className="w-full h-full max-h-none">
				{isSearching ? (
					<SearchResults
						query={inputValue}
						onOpenFile={onOpenFile}
						onClose={onClose}
					/>
				) : (
					<>
						<CommandEmpty>No results found.</CommandEmpty>
						<RecentFiles onOpenFile={onOpenFile} />
						<CommandSeparator />
						<CommandGroup heading="QUICK ACTIONS">
							<CommandItem
								onSelect={() => {
									onClose();
								}}
							>
								<Link2 />
								<span>Add a link</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									onClose();
								}}
							>
								<Folder />
								<span>Create a Space</span>
							</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="NAVIGATION">
							<CommandItem
								onSelect={() => {
									navigate({ to: "/app" });
									onClose();
								}}
							>
								<Home />
								<span>Home</span>
								<CommandShortcut>⌘H</CommandShortcut>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									navigate({ to: "/app" });
									onClose();
								}}
							>
								<Settings />
								<span>Settings</span>
								<CommandShortcut>⌘S</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</>
				)}
			</CommandList>
		</>
	);
}

export default function Commander() {
	const [open, setOpen] = useState(false);
	const [viewerFileId, setViewerFileId] = useState<string | null>(null);
	const [inputValue, setInputValue] = useState("");

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

	const handleClose = () => {
		setOpen(false);
		setInputValue("");
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			setInputValue("");
		}
	};

	const isSearching = inputValue.length > 0;

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

			{isMobile ? (
				<Drawer open={open} onOpenChange={handleOpenChange}>
					<DrawerContent className={isSearching ? "h-[95vh]" : "max-h-[80vh]"}>
						<DrawerHeader className="sr-only">
							<DrawerTitle>Search Files</DrawerTitle>
							<DrawerDescription>
								Search across all your files with AI-powered semantic search
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex flex-col overflow-hidden">
							<CommanderContent
								inputValue={inputValue}
								setInputValue={setInputValue}
								onOpenFile={handleOpenFile}
								onClose={handleClose}
								navigate={navigate}
							/>
						</div>
					</DrawerContent>
				</Drawer>
			) : (
				<CommandDialog
					open={open}
					onOpenChange={handleOpenChange}
					className={isSearching ? "min-w-1/2 h-[80vh]" : "min-w-1/2 h-1/2"}
					title="search dialog"
					shouldFilter={false}
				>
					<CommanderContent
						inputValue={inputValue}
						setInputValue={setInputValue}
						onOpenFile={handleOpenFile}
						onClose={handleClose}
						navigate={navigate}
					/>
				</CommandDialog>
			)}

			<FileViewerDialog
				open={!!viewerFileId}
				onOpenChange={(isOpen) => {
					if (!isOpen) setViewerFileId(null);
				}}
				fileId={viewerFileId}
			/>
		</>
	);
}
