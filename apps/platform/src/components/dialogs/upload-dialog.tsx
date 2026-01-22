"use client";

import { useState, useRef } from "react";
import { Button } from "@platform/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@platform/components/ui/dialog";
import { TagInput } from "@platform/components/ui/tag-input";
import { authClient } from "@platform/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import {
	IconCheck,
	IconFilePlus,
	IconLoader2,
	IconX,
	IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

type FileEntryStatus = "pending" | "uploading" | "success" | "error";

type FileEntry = {
	id: string;
	file: File;
	tags: string[];
	status: FileEntryStatus;
	error?: string;
};

type UploadDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	spaceId?: string | null;
};

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
	return Math.random().toString(36).substring(2, 11);
}

export default function UploadDialog({
	open,
	onOpenChange,
	spaceId,
}: UploadDialogProps) {
	const { data: sessionData } = authClient.useSession();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newEntries: FileEntry[] = Array.from(files).map((file) => ({
			id: generateId(),
			file,
			tags: [],
			status: "pending" as const,
		}));

		setFileEntries((prev) => [...prev, ...newEntries]);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const updateEntryTags = (entryId: string, tags: string[]) => {
		setFileEntries((prev) =>
			prev.map((entry) => (entry.id === entryId ? { ...entry, tags } : entry))
		);
	};

	const removeEntry = (entryId: string) => {
		setFileEntries((prev) => prev.filter((entry) => entry.id !== entryId));
	};

	const updateEntryStatus = (
		entryId: string,
		status: FileEntryStatus,
		error?: string
	) => {
		setFileEntries((prev) =>
			prev.map((entry) =>
				entry.id === entryId ? { ...entry, status, error } : entry
			)
		);
	};

	const handleUpload = async () => {
		if (fileEntries.length === 0) return;

		setIsUploading(true);
		let successCount = 0;
		const totalCount = fileEntries.length;

		const uploadPromises = fileEntries
			.filter((entry) => entry.status === "pending")
			.map(async (entry) => {
				updateEntryStatus(entry.id, "uploading");

				try {
					const formData = new FormData();
					formData.append("file", entry.file);
					if (spaceId) {
						formData.append("spaceId", spaceId);
					}
					if (entry.tags.length > 0) {
						formData.append("tags", JSON.stringify(entry.tags));
					}

					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						throw new Error(`Upload failed: ${response.statusText}`);
					}

					updateEntryStatus(entry.id, "success");
					successCount++;
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Upload failed";
					updateEntryStatus(entry.id, "error", errorMessage);
				}
			});

		await Promise.allSettled(uploadPromises);

		if (spaceId) {
			queryClient.invalidateQueries({
				queryKey: ["files", "inSpace", spaceId],
			});
		} else {
			queryClient.invalidateQueries({
				queryKey: [
					"files",
					"orphan",
					sessionData?.session.activeOrganizationId,
				],
			});
		}

		if (successCount === totalCount) {
			toast.success(
				totalCount === 1
					? "File uploaded successfully"
					: `${successCount} files uploaded successfully`
			);
			onOpenChange(false);
			setFileEntries([]);
		} else if (successCount > 0) {
			toast.warning(`${successCount} of ${totalCount} files uploaded`);
		} else {
			toast.error("Failed to upload files");
		}

		setIsUploading(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && !isUploading) {
			setFileEntries([]);
		}
		if (!isUploading) {
			onOpenChange(newOpen);
		}
	};

	const pendingEntries = fileEntries.filter((e) => e.status === "pending");
	const canUpload = pendingEntries.length > 0 && !isUploading;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Upload Files</DialogTitle>
					<DialogDescription>
						Select files and add optional tags to organize them.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<input
						ref={fileInputRef}
						type="file"
						multiple
						onChange={handleFileSelect}
						className="hidden"
					/>

					<Button
						type="button"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
						className="w-full"
					>
						<IconFilePlus className="w-4 h-4" />
						Select Files
					</Button>

					{fileEntries.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground text-sm">
							No files selected. Click the button above to select files.
						</div>
					) : (
						<div className="space-y-3 max-h-80 overflow-y-auto">
							{fileEntries.map((entry) => (
								<div key={entry.id} className="border rounded-lg p-3 space-y-2">
									<div className="flex items-center justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{entry.file.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatFileSize(entry.file.size)}
											</p>
										</div>
										<div className="flex items-center gap-1">
											{entry.status === "pending" && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => removeEntry(entry.id)}
												>
													<IconTrash className="w-4 h-4 text-muted-foreground" />
												</Button>
											)}
											{entry.status === "uploading" && (
												<IconLoader2 className="w-5 h-5 animate-spin text-primary" />
											)}
											{entry.status === "success" && (
												<IconCheck className="w-5 h-5 text-green-500" />
											)}
											{entry.status === "error" && (
												<IconX className="w-5 h-5 text-destructive" />
											)}
										</div>
									</div>
									<TagInput
										value={entry.tags}
										onChange={(tags) => updateEntryTags(entry.id, tags)}
										placeholder="Add tags..."
										disabled={entry.status !== "pending"}
									/>
									{entry.status === "error" && entry.error && (
										<p className="text-xs text-destructive">{entry.error}</p>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isUploading}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleUpload} disabled={!canUpload}>
						{isUploading ? (
							<>
								<IconLoader2 className="w-4 h-4 animate-spin" />
								Uploading...
							</>
						) : (
							`Upload${fileEntries.length > 0 ? ` (${pendingEntries.length})` : ""}`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
