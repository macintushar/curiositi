import { useState } from "react";
import { cn } from "@platform/lib/utils";
import { Badge } from "./ui/badge";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "./ui/context-menu";
import ConfirmDialog from "./confirm-dialog";
import FileIcon from "./file-icon";
import { Skeleton } from "./ui/skeleton";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

type FilePreviewProps = {
	file: {
		id: string;
		name: string;
		type: string;
	};
};

const fileTypeClasses = {
	file: "rounded-xl bg-card p-2 w-40 h-48",
};

export default function FilePreview({ file }: FilePreviewProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: sessionData } = authClient.useSession();
	const isImage = file.type.startsWith("image/");

	const presignedUrlQuery = useQuery({
		queryKey: ["file", "presignedUrl", file.id],
		queryFn: () => trpcClient.file.getPresignedUrl.query({ fileId: file.id }),
		enabled: isImage,
		staleTime: 1000 * 60 * 50,
	});

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
					<Link
						to="/app/item/$fileId"
						params={{ fileId: file.id }}
						className={cn(
							fileTypeClasses.file,
							"relative block hover:ring-2 hover:ring-primary/20 transition-all overflow-hidden"
						)}
					>
						{isImage && presignedUrlQuery.isLoading && (
							<Skeleton className="absolute inset-0 rounded-xl" />
						)}

						{isImage && presignedUrlQuery.data?.url && (
							<img
								src={presignedUrlQuery.data.url}
								alt={file.name}
								className="absolute inset-0 w-full h-full object-cover rounded-xl"
							/>
						)}

						{!isImage && (
							<div className="absolute inset-0 flex items-center justify-center">
								<FileIcon
									className="size-12 text-primary opacity-65"
									type={file.type}
								/>
							</div>
						)}

						<Badge
							variant={"secondary"}
							className="max-w-36 bg-secondary/40 flex items-center gap-1 absolute bottom-2.5 left-2"
						>
							<span>
								<FileIcon className="size-4" type={file.type} />
							</span>
							<p className="truncate">{file.name}</p>
						</Badge>
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
