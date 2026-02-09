import { useState } from "react";
import { Badge } from "../ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "../ui/context-menu";
import ConfirmDialog from "../dialogs/confirm-dialog";
import FileIcon from "../file-icon";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Link } from "@tanstack/react-router";

type FilePreviewProps = {
	file: {
		id: string;
		name: string;
		type: string;
	};
};

export default function FilePreview({ file }: FilePreviewProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: sessionData } = authClient.useSession();

	const downloadUrlQuery = useQuery({
		queryKey: ["file", "downloadUrl", file.id],
		queryFn: () => trpcClient.file.getPresignedUrl.query({ fileId: file.id }),
		enabled: false,
	});

	const deleteMutation = useMutation({
		mutationFn: () => trpcClient.file.delete.mutate({ fileId: file.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [
					"files",
					"orphan",
					sessionData?.session.activeOrganizationId,
				],
			});
			queryClient.invalidateQueries({
				queryKey: ["files"],
			});
			setIsDeleteDialogOpen(false);
			toast.success("File deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete file");
		},
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

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDeleteDialogOpen(true);
	};

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<Link to="/app/item/$fileId" params={{ fileId: file.id }}>
						<Card className="max-w-sm">
							<CardContent className="flex items-center justify-center">
								<FileIcon
									className="size-16 text-primary-foreground opacity-65"
									type={file.type}
								/>
							</CardContent>
							<CardFooter>
								<Tooltip>
									<TooltipTrigger>
										<Badge
											variant={"secondary"}
											className="max-w-32 bg-secondary/40 flex items-center gap-1"
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
					</Link>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={handleDownload}>
						<IconDownload className="w-4 h-4" />
						Download
					</ContextMenuItem>
					<ContextMenuItem variant="destructive" onClick={handleDeleteClick}>
						<IconTrash className="w-4 h-4" />
						Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

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
