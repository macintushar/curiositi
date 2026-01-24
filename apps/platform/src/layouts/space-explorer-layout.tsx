"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { selectSpaceSchema } from "@curiositi/db/schema";
import type z from "zod";
import { Button } from "@platform/components/ui/button";
import SpaceDialog from "@platform/components/dialogs/space-dialog";
import UploadDialog from "@platform/components/dialogs/upload-dialog";
import ExplorerView from "@platform/components/explorer-view";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@platform/components/ui/context-menu";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";

type FileType = {
	id: string;
	name: string;
	path: string;
	size: number;
	type: string;
	organizationId: string;
	uploadedById: string;
	status: "pending" | "processing" | "completed" | "failed";
	tags: unknown;
	processedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
};

type SpaceExplorerLayoutProps = {
	spaces?: z.infer<typeof selectSpaceSchema>[] | null;
	files?: FileType[] | null;
	isLoading?: boolean;
	emptyMessage?: string;
	spaceId?: string | null;
	header?: ReactNode;
};

export default function SpaceExplorerLayout({
	spaces,
	files,
	isLoading,
	emptyMessage,
	spaceId = null,
	header,
}: SpaceExplorerLayoutProps) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<div className="min-h-full">
						<div className="flex items-center justify-between mb-4">
							{header ?? <div />}

							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsUploadDialogOpen(true)}
								>
									<IconUpload className="w-4 h-4" />
									Upload
								</Button>
								<SpaceDialog
									mode="create"
									open={isCreateDialogOpen}
									onOpenChange={setIsCreateDialogOpen}
									parentSpaceId={spaceId}
									trigger={
										<Button variant="outline" size="sm">
											<IconFolderPlus className="w-4 h-4" />
											New Space
										</Button>
									}
								/>
							</div>
						</div>

						<ExplorerView
							spaces={spaces}
							files={files}
							isLoading={isLoading}
							emptyMessage={emptyMessage}
						/>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={() => setIsCreateDialogOpen(true)}>
						<IconFolderPlus className="w-4 h-4" />
						New Space
					</ContextMenuItem>
					<ContextMenuItem onClick={() => setIsUploadDialogOpen(true)}>
						<IconUpload className="w-4 h-4" />
						Upload File
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<UploadDialog
				open={isUploadDialogOpen}
				onOpenChange={setIsUploadDialogOpen}
				spaceId={spaceId}
			/>
		</>
	);
}
