"use client";

import { useState } from "react";
import type { selectSpaceSchema } from "@curiositi/db/schema";
import SpaceDialog from "@platform/components/dialogs/space-dialog";
import ConfirmDialog from "@platform/components/dialogs/confirm-dialog";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@platform/components/ui/context-menu";
import { cn } from "@platform/lib/utils";
import {
	IconFolder,
	IconFolderOpen,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import type z from "zod";

type SpacePreviewProps = {
	space: z.infer<typeof selectSpaceSchema>;
};

export default function SpacePreview({ space }: SpacePreviewProps) {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: sessionData } = authClient.useSession();

	const deleteMutation = useMutation({
		mutationFn: () => trpcClient.space.delete.mutate({ spaceId: space.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["spaces", "root", sessionData?.session.activeOrganizationId],
			});
			queryClient.invalidateQueries({
				queryKey: ["spaces"],
			});
			setIsDeleteDialogOpen(false);
			toast.success("Space deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete space");
		},
	});

	const handleEditClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsEditDialogOpen(true);
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
						to="/app/space/$spaceId"
						params={{ spaceId: space.id }}
						className={cn(
							"group relative flex flex-col overflow-hidden",
							"size-32 rounded-xl border bg-card",
							"hover:border-foreground/20 transition-colors cursor-pointer"
						)}
					>
						<div className="flex-1 flex items-center justify-center py-6">
							{space.icon ? (
								<span className="text-4xl">{space.icon}</span>
							) : (
								<>
									<IconFolder
										className="size-12 text-primary group-hover:hidden block"
										fill="currentColor"
									/>
									<IconFolderOpen
										className="size-12 text-primary group-hover:block hidden"
										fill="currentColor"
									/>
								</>
							)}
						</div>

						<div className="h-8 px-2 flex items-center bg-muted/50 border-t">
							<p className="text-xs text-foreground truncate w-full">
								{space.name}
							</p>
						</div>
					</Link>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={handleEditClick}>
						<IconPencil className="w-4 h-4" />
						Edit
					</ContextMenuItem>
					<ContextMenuItem variant="destructive" onClick={handleDeleteClick}>
						<IconTrash className="w-4 h-4" />
						Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<SpaceDialog
				mode="update"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				defaultValues={{
					id: space.id,
					name: space.name,
					description: space.description,
					icon: space.icon,
				}}
			/>

			<ConfirmDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				title="Delete Space"
				description={`Are you sure you want to delete "${space.name}"? This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={() => deleteMutation.mutate()}
				isLoading={deleteMutation.isPending}
				variant="destructive"
			/>
		</>
	);
}
