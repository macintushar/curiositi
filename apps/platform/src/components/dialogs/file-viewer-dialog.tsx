"use client";

import { useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@platform/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "@platform/components/ui/drawer";
import { useIsMobile } from "@platform/hooks/use-mobile";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import FileIcon from "@platform/components/file-icon";
import FileContentPreview from "@platform/components/previews/file-content-preview";
import { Skeleton } from "@platform/components/ui/skeleton";
import { IMAGE_TYPES, PDF_TYPE } from "@curiositi/share/constants";
import { toast } from "sonner";
import FileActions from "@platform/components/file-actions";
import type z from "zod";
import type { selectFileSchema } from "@curiositi/db/schema";
import { cn } from "@platform/lib/utils";

type FileViewerDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fileId: string | null;
};

type FileType = "image" | "pdf" | "text";

type FileData = z.infer<typeof selectFileSchema>;

type FileViewerHeaderProps = {
	file: FileData;
	presignedUrl: string | undefined;
};

type FileViewerContentProps = {
	isFileQueryLoading: boolean;
	file: FileData | undefined;
	fileType: FileType;
	presignedUrl: string | undefined;
	isMobile: boolean;
};

function FileViewerHeader({ file, presignedUrl }: FileViewerHeaderProps) {
	return (
		<div className="shrink-0 bg-card p-4 sm:p-6 border-t sm:border-t-0 sm:border-b rounded-t-xl sm:rounded-t-none sm:rounded-br-xl sm:rounded-bl-xl">
			<div className="flex items-start sm:items-center sm:flex-row flex-col gap-3 sm:gap-2 justify-between">
				<div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
					<div className="size-12 sm:size-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
						<FileIcon className="size-6 sm:size-8" type={file.type} />
					</div>
					<div className="min-w-0">
						<h1 className="text-lg sm:text-xl font-semibold truncate">
							{file.name}
						</h1>
						<p className="text-sm text-muted-foreground">
							{file.type} &middot; {(file.size / 1024).toFixed(1)} KB
						</p>
					</div>
				</div>
				<div className="flex gap-4 sm:gap-5 items-center text-xs sm:text-sm w-full sm:w-auto justify-between sm:justify-start">
					<div className="flex gap-4 sm:gap-5">
						<div>
							<p className="text-muted-foreground">Status</p>
							<p className="font-medium capitalize">{file.status}</p>
						</div>
						<div className="hidden sm:block">
							<p className="text-muted-foreground">Created</p>
							<p className="font-medium">
								{new Date(file.createdAt).toLocaleDateString()}
							</p>
						</div>
					</div>
					<FileActions
						presignedUrl={presignedUrl}
						fileStatus={file.status}
						fileName={file.name}
						fileId={file.id}
					/>
				</div>
			</div>
		</div>
	);
}

function FileViewerContent({
	isFileQueryLoading,
	file,
	fileType,
	presignedUrl,
	isMobile,
}: FileViewerContentProps) {
	if (isFileQueryLoading) {
		return (
			<div className="flex flex-col h-full">
				<Skeleton className="h-32 w-full mb-4" />
				<Skeleton className="flex-1 w-full" />
			</div>
		);
	}

	if (!file) {
		return (
			<div className="flex items-center justify-center h-full">
				<p>File not found.</p>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col h-full", isMobile && "flex-col-reverse")}>
			<div className="no-scrollbar overflow-y-auto p-2 sm:p-4 flex-1 min-h-0">
				<div className="flex flex-col h-full">
					<FileContentPreview
						file={file}
						fileType={fileType}
						presignedUrl={presignedUrl}
						isMobile={isMobile}
					/>
				</div>
			</div>
			<FileViewerHeader file={file} presignedUrl={presignedUrl} />
		</div>
	);
}

export default function FileViewerDialog({
	open,
	onOpenChange,
	fileId,
}: FileViewerDialogProps) {
	const isMobile = useIsMobile();
	const {
		data: fileData,
		error: fileQueryError,
		isLoading: isFileQueryLoading,
	} = useQuery({
		queryKey: ["file", fileId],
		queryFn: () => trpcClient.file.getById.query({ fileId: fileId ?? "" }),
		enabled: !!fileId && open,
	});

	const file = fileData?.data;

	const presignedUrlQuery = useQuery({
		queryKey: ["file", "presignedUrl", fileId],
		queryFn: () =>
			trpcClient.file.getPresignedUrl.query({ fileId: fileId ?? "" }),
		enabled: !!file && open,
		staleTime: 1000 * 60 * 50,
	});

	useEffect(() => {
		if (fileQueryError || fileData?.error) {
			toast.error("Error", {
				description: fileQueryError?.message || fileData?.error,
			});
		}
	}, [fileQueryError, fileData?.error]);

	const fileType: FileType = file
		? IMAGE_TYPES.includes(file.type)
			? "image"
			: PDF_TYPE === file.type
				? "pdf"
				: "text"
		: "text";

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="h-[95vh] flex flex-col p-0 gap-0">
					<DrawerHeader className="sr-only h-fit p-0">
						<DrawerTitle>File Viewer</DrawerTitle>
						<DrawerDescription>
							View file contents and details
						</DrawerDescription>
					</DrawerHeader>
					<FileViewerContent
						isFileQueryLoading={isFileQueryLoading}
						file={file}
						fileType={fileType}
						presignedUrl={presignedUrlQuery.data?.url}
						isMobile={true}
					/>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-none w-full min-w-full h-screen flex flex-col p-0 gap-0">
				<DialogHeader className="sr-only h-fit p-0">
					<DialogTitle>File Viewer</DialogTitle>
					<DialogDescription>View file contents and details</DialogDescription>
				</DialogHeader>
				<FileViewerContent
					isFileQueryLoading={isFileQueryLoading}
					file={file}
					fileType={fileType}
					presignedUrl={presignedUrlQuery.data?.url}
					isMobile={false}
				/>
			</DialogContent>
		</Dialog>
	);
}
