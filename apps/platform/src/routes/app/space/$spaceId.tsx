import { createFileRoute } from "@tanstack/react-router";
import SpaceExplorerLayout from "@platform/layouts/space-explorer-layout";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { IconArrowLeft, IconHome } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/space/$spaceId")({
	component: SpacePageComponent,
});

function SpacePageComponent() {
	const { spaceId } = Route.useParams();

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

	const headerContent = (
		<div className="flex flex-col gap-2">
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
			{space?.parentSpaceId && (
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
			)}
		</div>
	);

	return (
		<SpaceExplorerLayout
			spaces={childSpaces.data?.data}
			files={filesInSpace.data?.data}
			isLoading={isLoading}
			emptyMessage="This space is empty."
			spaceId={spaceId}
			header={headerContent}
		/>
	);
}
