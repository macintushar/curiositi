import SpaceExplorerLayout from "@platform/layouts/space-explorer-layout";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
	const { data: sessionData } = authClient.useSession();

	const rootSpaces = useQuery({
		queryKey: ["spaces", "root", sessionData?.session.activeOrganizationId],
		queryFn: () => trpcClient.space.getRoot.query(),
	});

	const orphanFiles = useQuery({
		queryKey: ["files", "orphan", sessionData?.session.activeOrganizationId],
		queryFn: () => trpcClient.file.getOrphanFiles.query(),
	});

	const isLoading = rootSpaces.isLoading || orphanFiles.isLoading;

	return (
		<div className="flex flex-col h-screen overflow-scroll">
			<SpaceExplorerLayout
				spaces={rootSpaces.data?.data}
				files={orphanFiles.data?.data}
				isLoading={isLoading}
				spaceId={null}
			/>
		</div>
	);
}
