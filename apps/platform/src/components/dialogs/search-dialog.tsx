"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@platform/components/ui/dialog";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import {
	formatDate,
	formatFileSize,
	getFileTypeLabel,
} from "@platform/lib/search-utils";
import { useQuery } from "@tanstack/react-query";
import { Folder, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { FileTags, useDebounce } from "../file-helpers";
import { Badge } from "@platform/components/ui/badge";
import { Button } from "@platform/components/ui/button";
import { Input } from "@platform/components/ui/input";

import { Skeleton } from "@platform/components/ui/skeleton";
import type { SearchResult } from "@curiositi/api-handlers";
import FileIcon from "../file-icon";
import { IconSparkles2 } from "@tabler/icons-react";

type SearchDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onOpenFile: (fileId: string) => void;
	initialQuery?: string;
};

export function SearchDialog({
	open,
	onOpenChange,
	onOpenFile,
	initialQuery = "",
}: SearchDialogProps) {
	const [query, setQuery] = useState(initialQuery);
	const debouncedQuery = useDebounce(query, 300);

	const searchResults = useQuery({
		queryKey: ["search-dialog", "results", debouncedQuery],
		queryFn: () =>
			trpcClient.file.searchWithAI.query({
				query: debouncedQuery,
				limit: 20,
				minSimilarity: 0.7,
			}),
		enabled: debouncedQuery.length > 1 && open,
	});

	const handleOpenFile = (fileId: string) => {
		onOpenFile(fileId);
	};

	const results = searchResults.data?.data || [];
	const totalResults = searchResults.data?.data?.length || 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-w-none w-full min-w-full h-screen flex flex-col p-0 gap-0 border-0"
				showCloseButton={false}
			>
				<DialogHeader className="sr-only">
					<DialogTitle>Search Files</DialogTitle>
					<DialogDescription>
						Search across all your files with AI-powered semantic search
					</DialogDescription>
				</DialogHeader>

				{/* Header with search input */}
				<div className="bg-card rounded-br-xl rounded-bl-xl p-6 border shrink-0">
					<div className="flex items-center gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
							<Input
								placeholder="Search files by name, content, or concept..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="pl-10 h-12"
								autoFocus
							/>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onOpenChange(false)}
						>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Results area */}
				<div className="flex-1 overflow-y-auto p-6">
					{debouncedQuery.length <= 1 ? (
						<div className="h-full flex items-center justify-center text-muted-foreground">
							<p>Start typing to search your files</p>
						</div>
					) : searchResults.isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					) : totalResults === 0 ? (
						<div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
							<Search className="w-12 h-12 opacity-50" />
							<p className="text-lg">No files found</p>
						</div>
					) : (
						<div className="space-y-6">
							<p className="text-sm text-muted-foreground mb-4">
								{totalResults} result{totalResults !== 1 ? "s" : ""} found
							</p>

							{/* AI Results */}
							{totalResults > 0 && (
								<div className="space-y-2">
									{results.map((result: SearchResult) => (
										<button
											type="button"
											key={result.file.id}
											onClick={() => handleOpenFile(result.file.id)}
											className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
										>
											<div className="flex items-start gap-4">
												<div className="shrink-0 size-12 rounded-lg bg-muted flex items-center justify-center">
													<FileIcon
														type={result.file.type}
														className={`w-6 h-6`}
														coloredIcon
													/>
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<span className="font-medium truncate">
															{result.file.name}
														</span>
														<IconSparkles2 className="h-8 text-yellow-300" />
														<Badge variant="secondary">AI match</Badge>
													</div>
													<div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
														<span>{getFileTypeLabel(result.file.type)}</span>
														<span>{formatFileSize(result.file.size)}</span>
														<span>{formatDate(result.file.createdAt)}</span>
														<span>score: {result.score}</span>
														{result.spaceName && (
															<span className="flex items-center gap-1">
																<Folder className="w-3 h-3" />
																{result.spaceName}
															</span>
														)}
													</div>
													<FileTags tags={result.file.tags} />
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Loading indicator for AI search */}
				{searchResults.isFetching && (
					<div className="absolute bottom-6 right-6 flex items-center gap-2 bg-card border rounded-full px-4 py-2 shadow-lg">
						<Loader2 className="w-4 h-4 animate-spin" />
						<span className="text-sm">AI searching...</span>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
