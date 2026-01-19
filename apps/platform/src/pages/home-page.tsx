import { useState } from "react";
import { Button } from "@platform/components/ui/button";
import SpaceDialog from "@platform/components/space-dialog";
import UploadDialog from "@platform/components/upload-dialog";
import ExplorerView from "@platform/components/explorer-view";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@platform/components/ui/context-menu";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { IconFolderPlus, IconUpload } from "@tabler/icons-react";

export default function HomePage() {
	const { data: sessionData } = authClient.useSession();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	const rootSpaces = useQuery({
		queryKey: ["spaces", "root", sessionData?.session.activeOrganizationId],
		queryFn: () => trpcClient.space.getRoot.query(),
	});

	const orphanFiles = useQuery({
		queryKey: ["files", "orphan", sessionData?.session.activeOrganizationId],
		queryFn: () => trpcClient.file.getOrphanFiles.query(),
	});

	const isLoading = rootSpaces.isLoading || orphanFiles.isLoading;

	const handleUploadClick = () => {
		setIsUploadDialogOpen(true);
	};

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					<div className="p-4 min-h-full">
						<div className="flex items-center justify-between mb-4">
							<div />

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
									parentSpaceId={null}
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
							spaces={rootSpaces.data?.data}
							files={orphanFiles.data?.data}
							isLoading={isLoading}
						/>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={() => setIsCreateDialogOpen(true)}>
						<IconFolderPlus className="w-4 h-4" />
						New Space
					</ContextMenuItem>
					<ContextMenuItem onClick={handleUploadClick}>
						<IconUpload className="w-4 h-4" />
						Upload File
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<UploadDialog
				open={isUploadDialogOpen}
				onOpenChange={setIsUploadDialogOpen}
				spaceId={null}
			/>
		</>
	);
}
