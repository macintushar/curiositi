"use client";

import * as React from "react";
import { Folder, Home, Link2, Settings, File, Sparkles } from "lucide-react";
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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Component that uses cmdk's internal state for search
function SearchResults({
	onNavigate,
}: {
	onNavigate: (path: string, params?: Record<string, string>) => void;
}) {
	const search = useCommandState((state) => state.search);
	const debouncedQuery = useDebounce(search, 300);
	const [useAISearch, setUseAISearch] = React.useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset when query changes
	React.useEffect(() => {
		setUseAISearch(false);
	}, [debouncedQuery]);

	// Name-only search (fast)
	const fileSearch = useQuery({
		queryKey: ["commander", "files", "name", debouncedQuery],
		queryFn: () => trpcClient.file.search.query({ query: debouncedQuery }),
		enabled: debouncedQuery.length > 1 && !useAISearch,
	});

	// AI search (semantic)
	const aiSearch = useQuery({
		queryKey: ["commander", "files", "ai", debouncedQuery],
		queryFn: () =>
			trpcClient.file.searchWithAI.query({ query: debouncedQuery }),
		enabled: debouncedQuery.length > 1 && useAISearch,
	});

	// Space search
	const spaceSearch = useQuery({
		queryKey: ["commander", "spaces", debouncedQuery],
		queryFn: () => trpcClient.space.getRoot.query(),
		enabled: debouncedQuery.length > 1,
	});

	const searchResults = useAISearch
		? aiSearch.data?.data
		: fileSearch.data?.data;

	// Filter spaces by name
	const filteredSpaces = React.useMemo(() => {
		if (!debouncedQuery || !spaceSearch.data?.data) return [];
		return spaceSearch.data.data.filter((space) =>
			space.name.toLowerCase().includes(debouncedQuery.toLowerCase())
		);
	}, [spaceSearch.data?.data, debouncedQuery]);

	const handleAISearch = () => {
		if (debouncedQuery.length > 0) {
			setUseAISearch(true);
		}
	};

	if (debouncedQuery.length <= 1) {
		return null;
	}

	return (
		<>
			{/* Search Results - Files */}
			{searchResults && searchResults.length > 0 && (
				<CommandGroup heading={useAISearch ? "FILES (AI SEARCH)" : "FILES"}>
					{searchResults.slice(0, 5).map((result) => (
						<CommandItem
							key={result.file.id}
							value={`file-${result.file.id}-${result.file.name}`}
							onSelect={() => {
								onNavigate("/app/item/$fileId", { fileId: result.file.id });
							}}
						>
							<File className="w-4 h-4" />
							<span>{result.file.name}</span>
							{result.matchType === "content" && (
								<span className="text-muted-foreground text-xs ml-auto">
									content match
								</span>
							)}
						</CommandItem>
					))}
				</CommandGroup>
			)}

			<CommandSeparator />

			{/* Search Results - Spaces */}
			{filteredSpaces.length > 0 && (
				<CommandGroup heading="SPACES">
					{filteredSpaces.slice(0, 3).map((space) => (
						<CommandItem
							key={space.id}
							value={`space-${space.id}-${space.name}`}
							onSelect={() => {
								onNavigate("/app/space/$spaceId", { spaceId: space.id });
							}}
						>
							<Folder className="w-4 h-4" />
							<span>{space.name}</span>
						</CommandItem>
					))}
				</CommandGroup>
			)}

			{/* AI Search Option - always visible during search */}
			{!useAISearch && (
				<>
					<CommandSeparator />
					<CommandGroup forceMount>
						<CommandItem
							value="search-with-ai"
							onSelect={handleAISearch}
							forceMount
						>
							<Sparkles className="w-4 h-4" />
							<span>Search with AI</span>
							<span className="text-muted-foreground text-xs ml-auto">
								{aiSearch.isFetching ? "Searching..." : "semantic search"}
							</span>
						</CommandItem>
					</CommandGroup>
				</>
			)}

			<CommandSeparator />
		</>
	);
}

export default function Commander() {
	const [open, setOpen] = React.useState(false);
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

					{/* Dynamic Search Results */}
					<SearchResults onNavigate={handleNavigate} />

					{/* Quick Actions */}
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

					{/* Navigation */}
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

					{/* Theme Selection */}
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
		</>
	);
}
