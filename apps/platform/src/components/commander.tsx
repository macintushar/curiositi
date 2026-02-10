"use client";

import * as React from "react";
import {
	Folder,
	Home,
	Link2,
	Settings,
	File,
	Sparkles,
	Image,
	FileText,
} from "lucide-react";
import { useCommandState } from "cmdk";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
	CommandSubItem,
} from "@platform/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "./theme-provider";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@platform/hooks/use-mobile";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
	formatFileSize,
	formatDate,
	getFileTypeColor,
	getFileTypeLabel,
} from "@platform/lib/search-utils";
import type { SearchResult } from "@curiositi/api-handlers";
import FileViewerDialog from "./dialogs/file-viewer-dialog";

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState(value);
	React.useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);
	return debouncedValue;
}

function FileTypeIcon({
	type,
	className,
}: {
	type: string;
	className?: string;
}) {
	if (type.startsWith("image/")) return <Image className={className} />;
	if (type === "application/pdf") return <FileText className={className} />;
	return <File className={className} />;
}

function FileTags({ tags }: { tags: unknown }) {
	const tagArray = (tags as { tags?: string[] })?.tags;
	if (!Array.isArray(tagArray) || tagArray.length === 0) return null;
	return (
		<div className="flex items-center gap-1 mt-1">
			{tagArray.map((tag) => (
				<Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
					{tag}
				</Badge>
			))}
		</div>
	);
}

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
					<FileTypeIcon
						type={result.file.type}
						className={`w-4 h-4 ${getFileTypeColor(result.file.type)}`}
					/>
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
	onNavigate,
	onOpenFile,
}: {
	onNavigate: (path: string, params?: Record<string, string>) => void;
	onOpenFile: (fileId: string) => void;
}) {
	const search = useCommandState((state) => state.search);
	const debouncedQuery = useDebounce(search, 300);
	const [useAISearch, setUseAISearch] = React.useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset AI search state when query changes
	React.useEffect(() => {
		setUseAISearch(false);
	}, [debouncedQuery]);

	const fileSearch = useQuery({
		queryKey: ["commander", "files", "search", debouncedQuery],
		queryFn: () =>
			trpcClient.file.search.query({ query: debouncedQuery, limit: 10 }),
		enabled: debouncedQuery.length > 1 && !useAISearch,
	});

	const aiSearch = useQuery({
		queryKey: ["commander", "files", "ai", debouncedQuery],
		queryFn: () =>
			trpcClient.file.searchWithAI.query({ query: debouncedQuery, limit: 10 }),
		enabled: debouncedQuery.length > 1 && useAISearch,
	});

	const { data: spacesData } = useQuery({
		queryKey: ["commander", "spaces"],
		queryFn: () => trpcClient.space.getRoot.query(),
		enabled: debouncedQuery.length > 1,
	});

	const searchResults = useAISearch
		? aiSearch.data?.data
		: fileSearch.data?.data;

	if (debouncedQuery.length <= 1)
		return <RecentFiles onOpenFile={onOpenFile} />;

	return (
		<>
			{searchResults && searchResults.length > 0 && (
				<CommandGroup heading={useAISearch ? "FILES (AI SEARCH)" : "FILES"}>
					{searchResults.slice(0, 8).map((result: SearchResult) => (
						<CommandItem
							key={result.file.id}
							value={`file-${result.file.id}-${result.file.name}`}
							onSelect={() => onOpenFile(result.file.id)}
						>
							<FileTypeIcon
								type={result.file.type}
								className={`w-4 h-4 ${getFileTypeColor(result.file.type)}`}
							/>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="truncate">{result.file.name}</span>
									{result.matchType === "content" && (
										<Badge variant="secondary" className="text-xs">
											AI match
										</Badge>
									)}
									{result.matchType === "space" && (
										<Badge variant="outline" className="text-xs">
											space match
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
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
					))}
				</CommandGroup>
			)}

			{spacesData?.data && spacesData.data.length > 0 && (
				<>
					<CommandSeparator />
					<CommandGroup heading="SPACES">
						{spacesData.data
							.filter((space: { name: string }) =>
								space.name.toLowerCase().includes(debouncedQuery.toLowerCase())
							)
							.slice(0, 5)
							.map((space: { id: string; name: string }) => (
								<CommandItem
									key={space.id}
									value={`space-${space.id}-${space.name}`}
									onSelect={() =>
										onNavigate("/app/space/$spaceId", { spaceId: space.id })
									}
								>
									<Folder className="w-4 h-4 text-blue-500" />
									<span>{space.name}</span>
								</CommandItem>
							))}
					</CommandGroup>
				</>
			)}

			{!useAISearch && debouncedQuery.length > 1 && (
				<>
					<CommandSeparator />
					<CommandGroup forceMount>
						<CommandItem
							value="search-with-ai"
							onSelect={() => setUseAISearch(true)}
							forceMount
						>
							<Sparkles className="w-4 h-4 text-yellow-500" />
							<span>Search with AI</span>
							<span className="text-muted-foreground text-xs ml-auto">
								{aiSearch.isFetching ? "Searching..." : "semantic search"}
							</span>
						</CommandItem>
					</CommandGroup>
				</>
			)}
		</>
	);
}

export default function Commander() {
	const [open, setOpen] = React.useState(false);
	const [viewerFileId, setViewerFileId] = React.useState<string | null>(null);
	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const { setTheme } = useTheme();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const handleNavigate = (path: string, params?: Record<string, string>) => {
		navigate({ to: path as string, params: params as Record<string, string> });
		setOpen(false);
	};

	const handleOpenFile = (fileId: string) => {
		setViewerFileId(fileId);
		setOpen(false);
	};

	return (
		<>
			{isMobile ? (
				<Button onClick={() => setOpen(true)}>
					<IconSearch className="size-5" />
				</Button>
			) : (
				<p className="text-muted-foreground text-sm">
					Press{" "}
					<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
						<span className="text-xs">
							{navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl"}
						</span>
						+ J
					</kbd>
				</p>
			)}
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search files, spaces, or type a command..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<SearchResults
						onNavigate={handleNavigate}
						onOpenFile={handleOpenFile}
					/>
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
					<CommandSubItem
						onSelect={() => {
							setTheme("system");
							setOpen(false);
						}}
					>
						Set theme: System
					</CommandSubItem>
					<CommandSubItem
						onSelect={() => {
							setTheme("dark");
							setOpen(false);
						}}
					>
						Set theme: Dark
					</CommandSubItem>
					<CommandSubItem
						onSelect={() => {
							setTheme("light");
							setOpen(false);
						}}
					>
						Set theme: Light
					</CommandSubItem>
				</CommandList>
			</CommandDialog>
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
