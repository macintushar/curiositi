import { InvitationStatus } from "better-auth/plugins";

export function EmptyState() {
	return (
		<div className="rounded-2xl">
			<div className="flex flex-col items-center justify-center py-20 px-6 text-center">
				<h3 className="text-xl font-semibold text-foreground mb-2">
					All caught up
				</h3>
				<span className="text-sm text-muted-foreground">
					~ notifications sync automatically ~
				</span>
			</div>
		</div>
	);
}

export type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  role: "member" | "admin" | "owner";
  status: InvitationStatus;
  inviterId: string;
  expiresAt: Date;
  createdAt: Date;
  organizationName: string;
}
