import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@platform/components/ui/button";
import SpaceDialog from "@platform/components/space-dialog";
import ExplorerView from "@platform/components/explorer-view";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { IconArrowLeft, IconFolderPlus, IconHome } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/space/$spaceId")({
	component: SpacePageComponent,
});

function SpacePageComponent() {
	const { spaceId } = Route.useParams();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const spaceQuery = useQuery({
		queryKey: ["space", "withAncestry", spaceId],
		queryFn: () => trpcClient.space.getWithAncestry.query({ spaceId }),
	});

	const childSpaces = useQuery({
		queryKey: ["spaces", "children", spaceId],
		queryFn: () =>
			trpcClient.space.getChildren.query({ parentSpaceId: spaceId }),
	});

	const filesInSpace = useQuery({
		queryKey: ["files", "inSpace", spaceId],
		queryFn: () => trpcClient.space.getFilesInSpace.query({ spaceId }),
	});

	const space = spaceQuery.data?.data;
	const isLoading =
		spaceQuery.isLoading || childSpaces.isLoading || filesInSpace.isLoading;

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<nav className="flex items-center gap-1 text-sm">
						<Link
							to="/app"
							className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
						>
							<IconHome className="w-4 h-4" />
							Home
						</Link>
						{space?.ancestors?.map((ancestor) => (
							<span key={ancestor.id} className="flex items-center gap-1">
								<span className="text-muted-foreground">/</span>
								<Link
									to="/app/space/$spaceId"
									params={{ spaceId: ancestor.id }}
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									{ancestor.icon && <span>{ancestor.icon}</span>}
									{ancestor.name}
								</Link>
							</span>
						))}
						<span className="text-muted-foreground">/</span>
						<span className="font-medium">
							{space?.icon && <span>{space.icon} </span>}
							{space?.name}
						</span>
					</nav>
				</div>

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

			{space?.parentSpaceId && (
				<div className="mb-4">
					<Link
						to={
							space.ancestors && space.ancestors.length > 0
								? "/app/space/$spaceId"
								: "/app"
						}
						params={
							space.ancestors && space.ancestors.length > 0
								? {
										spaceId:
											space.ancestors[space.ancestors.length - 1]?.id ?? "",
									}
								: {}
						}
						className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<IconArrowLeft className="w-4 h-4" />
						Back
					</Link>
				</div>
			)}

			<ExplorerView
				spaces={childSpaces.data?.data}
				files={filesInSpace.data?.data}
				isLoading={isLoading}
				emptyMessage="This space is empty."
			/>
		</div>
	);
}
