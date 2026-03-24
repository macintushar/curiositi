import { UserPlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import InvitedUsers from "./invited-users";
import SettingsLayout, { ActionCard, LayoutHead } from "./settings-layout";
import UsersTable from "./users-table";
import { useState } from "react";
import InviteDialog from "../dialogs/invite-dialog";

export default function WorkspaceSettings() {
	const [inviteOpen, setInviteOpen] = useState(false);
	return (
		<SettingsLayout
			title="Workspace Settings"
			description="Update your workspace settings & manage your members"
		>
			<ActionCard>
				<div>
					<LayoutHead
						title="Members"
						description="Current members of this workspace"
					/>
					<UsersTable />
				</div>
			</ActionCard>
			<ActionCard>
				<div>
					<div className="flex flex-wrap justify-between items-center">
						<LayoutHead
							title="Invited Users"
							description="Users invited to join this workspace"
						/>
						<Button onClick={() => setInviteOpen(true)}>
							<UserPlusIcon className="size-4" />
							Invite Member
						</Button>
					</div>
					<InvitedUsers />
					<InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
				</div>
			</ActionCard>
		</SettingsLayout>
	);
}
