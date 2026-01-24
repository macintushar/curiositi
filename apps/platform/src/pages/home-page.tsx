import SpaceExplorerLayout from "@platform/layouts/space-explorer-layout";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import TimeMessage from "@platform/components/time-message";

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
		<>
			<TimeMessage userName={sessionData?.user.name} />
			<SpaceExplorerLayout
				spaces={rootSpaces.data?.data}
				files={orphanFiles.data?.data}
				isLoading={isLoading}
				spaceId={null}
			/>
		</>
	);
}
