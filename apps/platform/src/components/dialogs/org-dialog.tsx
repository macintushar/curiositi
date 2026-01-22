import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@platform/components/ui/dialog";
import OrganizationForm from "@platform/forms/organization";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";

type OrgDialogProps = {
	open: boolean;
	mode: "create" | "edit";
	defaultValues?: {
		id: string;
		name: string;
		slug: string;
	};
	onOpenChange: (open: boolean) => void;
};

const title = {
	create: "Create a new Workspace",
	edit: "Edit Workspace",
};

export default function OrgDialog({
	open,
	mode = "create",
	defaultValues,
	onOpenChange,
}: OrgDialogProps) {
	const { data, error } = authClient.useSession();

	if (!data?.session) {
		return null;
	}
	if (error) {
		toast.error(error.message);
		return null;
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title[mode]}</DialogTitle>
				</DialogHeader>
				<OrganizationForm
					userId={data.session.userId}
					mode={mode}
					defaultValues={defaultValues}
					nextStep={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
