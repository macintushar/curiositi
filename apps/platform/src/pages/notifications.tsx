import { EmptyState } from "@platform/components/notifications";
import { InvitationCard } from "@platform/components/notifications/invitation";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { authClient } from "@platform/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export default function Notifications() {
	const { data: session } = authClient.useSession();

	const { data: invitationsData, isPending } = useQuery({
		queryKey: ["invitations", "pending"],
		queryFn: () => trpcClient.invitation.getPending.query(),
		enabled: !!session?.user?.email,
	});

	if (!invitationsData?.invitations) {
		return <EmptyState />;
	}

	const invitations = invitationsData.invitations;
	return (
		<div>
			{isPending ? (
				<h1 className="text-center text-muted-foreground">Loading...</h1>
			) : invitations.length === 0 ? (
				<EmptyState />
			) : (
				<div className="space-y-3">
					<div className="space-y-1">
						<h1>Workspace Invitations</h1>
						<p className="text-sm text-muted-foreground">
							You've been invited to join these workspaces. You can switch
							workspaces from the sidebar.
						</p>
					</div>
					{invitations.map((invitation) => (
						<InvitationCard key={invitation.id} invitation={invitation} />
					))}
				</div>
			)}
		</div>
	);
}
