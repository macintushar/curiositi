"use client";

import { useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
} from "@platform/components/ui/dialog";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import FileIcon from "@platform/components/file-icon";
import FileContentPreview from "@platform/components/previews/file-content-preview";
import { Skeleton } from "@platform/components/ui/skeleton";
import {
	IMAGE_TYPES,
	PDF_TYPE,
	TEXT_FILE_TYPES,
} from "@curiositi/share/constants";
import { toast } from "sonner";
import FileActions from "@platform/components/file-actions";

type FileViewerDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fileId: string | null;
};

export default function FileViewerDialog({
	open,
	onOpenChange,
	fileId,
}: FileViewerDialogProps) {
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

	const fileType: "image" | "pdf" | "text" = file
		? IMAGE_TYPES.includes(file.type)
			? "image"
			: PDF_TYPE === file.type
				? "pdf"
				: TEXT_FILE_TYPES.includes(file.type)
					? "text"
					: "text"
		: "text";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-none w-full min-w-full h-screen flex flex-col p-0 gap-0">
				{isFileQueryLoading ? (
					<div className="flex flex-col h-full">
						<Skeleton className="h-32 w-full mb-4" />
						<Skeleton className="flex-1 w-full" />
					</div>
				) : !file ? (
					<div className="flex items-center justify-center h-full">
						<p>File not found.</p>
					</div>
				) : (
					<>
						<DialogHeader className="h-fit">
							<div className="shrink-0 bg-card rounded-br-xl rounded-bl-xl p-6 border">
								<div className="flex items-center sm:flex-row flex-col gap-2 justify-between">
									<div className="flex items-center gap-4">
										<div className="size-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
											<FileIcon className="size-8" type={file.type} />
										</div>
										<div>
											<h1 className="text-xl font-semibold">{file.name}</h1>
											<p className="text-sm text-muted-foreground">
												{file.type} &middot; {(file.size / 1024).toFixed(1)} KB
											</p>
										</div>
									</div>
									<div className="flex gap-5 items-center text-sm">
										<div>
											<p className="text-muted-foreground">Status</p>
											<p className="font-medium capitalize">{file.status}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Created</p>
											<p className="font-medium">
												{new Date(file.createdAt).toLocaleDateString()}
											</p>
										</div>
										<FileActions
											presignedUrl={presignedUrlQuery.data?.url}
											fileStatus={file.status}
											fileName={file.name}
											fileId={file.id}
										/>
									</div>
								</div>
							</div>
						</DialogHeader>
						<div className="no-scrollbar overflow-y-auto p-4 h-full">
							<div className="flex-1 min-h-0 overflow-auto h-full w-full">
								<div className="flex flex-col h-full">
									<FileContentPreview
										file={file}
										fileType={fileType}
										presignedUrl={presignedUrlQuery.data?.url}
									/>
								</div>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
