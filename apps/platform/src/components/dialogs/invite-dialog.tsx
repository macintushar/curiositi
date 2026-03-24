import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@platform/components/ui/dialog";
import InviteForm from "@platform/forms/invite";
import { toast } from "sonner";
import { authClient } from "@platform/lib/auth-client";

type InviteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function InviteDialog({
	open,
	onOpenChange,
}: InviteDialogProps) {
	const { data, error } = authClient.useActiveOrganization();

	if (error) {
		toast.error(error.message);
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Member</DialogTitle>
					<DialogDescription>
						Invite a new member to this workspace.
					</DialogDescription>
				</DialogHeader>
				<InviteForm
					organizationId={data?.id}
					onSuccess={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
