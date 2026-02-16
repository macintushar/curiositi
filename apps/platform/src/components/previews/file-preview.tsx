import { useState } from "react";
import { Badge } from "../ui/badge";
import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "../ui/context-menu";
import ConfirmDialog from "../dialogs/confirm-dialog";
import FileViewerDialog from "../dialogs/file-viewer-dialog";
import FileIcon from "../file-icon";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useDeleteMutation } from "@platform/hooks/use-delete-mutation";
import { stopPropagation } from "@platform/lib/utils";

type FilePreviewProps = {
	file: {
		id: string;
		name: string;
		type: string;
	};
};

export default function FilePreview({ file }: FilePreviewProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isViewerOpen, setIsViewerOpen] = useState(false);

	const downloadUrlQuery = useQuery({
		queryKey: ["file", "presignedUrl", file.id],
		queryFn: () => trpcClient.file.getPresignedUrl.query({ fileId: file.id }),
		enabled: false,
	});

	const deleteMutation = useDeleteMutation({
		mutationFn: () => trpcClient.file.delete.mutate({ fileId: file.id }),
		resourceType: "file",
		resourceName: "File",
		onSuccess: () => setIsDeleteDialogOpen(false),
	});

	const handleDownload = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const result = await downloadUrlQuery.refetch();
			if (result.data?.url) {
				const link = document.createElement("a");
				link.href = result.data.url;
				link.download = file.name;
				link.target = "_blank";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch {
			toast.error("Failed to download file");
		}
	};

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<button
						type="button"
						className="text-left cursor-pointer"
						onClick={() => setIsViewerOpen(true)}
					>
						<Card className="max-w-sm shadow-none hover:border-foreground/20 transition-colors">
							<CardContent className="flex items-center justify-center">
								<FileIcon
									className="size-16 stroke-[1.5] transition-all"
									type={file.type}
									coloredIcon
								/>
							</CardContent>
							<CardFooter>
								<Tooltip>
									<TooltipTrigger asChild>
										<Badge
											variant={"secondary"}
											className="max-w-32 bg-secondary flex items-center gap-1"
										>
											<span>
												<FileIcon className="size-4" type={file.type} />
											</span>
											<p className="truncate">{file.name}</p>
										</Badge>
									</TooltipTrigger>
									<TooltipContent>{file.name}</TooltipContent>
								</Tooltip>
							</CardFooter>
						</Card>
					</button>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={handleDownload}>
						<IconDownload className="w-4 h-4" />
						Download
					</ContextMenuItem>
					<ContextMenuItem
						variant="destructive"
						onClick={stopPropagation(() => setIsDeleteDialogOpen(true))}
					>
						<IconTrash className="w-4 h-4" />
						Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<FileViewerDialog
				open={isViewerOpen}
				onOpenChange={setIsViewerOpen}
				fileId={file.id}
			/>

			<ConfirmDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				title="Delete File"
				description={`Are you sure you want to delete "${file.name}"? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={() => deleteMutation.mutate()}
				isLoading={deleteMutation.isPending}
				variant="destructive"
			/>
		</>
	);
}
