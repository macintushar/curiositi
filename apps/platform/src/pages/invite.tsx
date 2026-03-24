import { Button } from "@platform/components/ui/button";
import AuthFormLayout from "@platform/layouts/auth-form-layout";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import logger from "@curiositi/share/logger";

type InviteState =
	| { status: "loading" }
	| { status: "error"; message: string }
	| { status: "success" }
	| { status: "needs-auth" };

type InviteProps = {
	token?: string;
};

export default function Invite({ token }: InviteProps) {
	const navigate = useNavigate();
	const [state, setState] = useState<InviteState>({ status: "loading" });

	const handleAcceptInvitation = useCallback(
		async (invitationId: string) => {
			const res = await authClient.organization.acceptInvitation({
				invitationId,
			});

			if (res.error) {
				logger.error(res.error.message);
				if (res.error.message?.toLowerCase().includes("unauthorized")) {
					setState({ status: "needs-auth" });
				} else {
					setState({
						status: "error",
						message: res.error.message ?? "Unknown error",
					});
				}
			} else {
				setState({ status: "success" });
				toast.success("Invitation accepted successfully");
				setTimeout(() => {
					navigate({ to: "/app" });
				}, 2000);
			}
		},
		[navigate]
	);

	useEffect(() => {
		if (!token) {
			setState({ status: "error", message: "Invalid invitation link" });
			return;
		}

		logger.info("Token: ", token);

		handleAcceptInvitation(token);
	}, [token, handleAcceptInvitation]);

	if (state.status === "loading") {
		return (
			<AuthFormLayout
				title="Accepting Invitation"
				subtitle="Please wait while we process your invitation"
				onSubmit={async () => {}}
				submitButton={<Button disabled>Continue</Button>}
				linkText=""
				linkLabel=""
				linkTo="/sign-in"
			>
				<div className="text-sm text-muted-foreground">
					Processing your invitation...
				</div>
			</AuthFormLayout>
		);
	}

	if (state.status === "error") {
		return (
			<AuthFormLayout
				title="Invitation Error"
				subtitle="We could not process your invitation"
				onSubmit={async () => {}}
				submitButton={<Button disabled>Continue</Button>}
				linkText="Need help?"
				linkLabel="Contact support"
				linkTo="/sign-in"
			>
				<div className="text-sm text-muted-foreground">{state.message}</div>
			</AuthFormLayout>
		);
	}

	if (state.status === "needs-auth") {
		return (
			<AuthFormLayout
				title="Sign In Required"
				subtitle="Please sign in to accept this invitation"
				onSubmit={async () => {}}
				submitButton={
					<Button onClick={() => navigate({ to: "/sign-in" })}>Sign In</Button>
				}
				linkText="Don't have an account?"
				linkLabel="Sign up"
				linkTo="/sign-up"
			>
				<div className="text-sm text-muted-foreground">
					You need to be signed in to accept workspace invitations.
				</div>
			</AuthFormLayout>
		);
	}

	return (
		<AuthFormLayout
			title="Invitation Accepted"
			subtitle="You have successfully joined the workspace"
			onSubmit={async () => {}}
			submitButton={<Button disabled>Continue</Button>}
			linkText=""
			linkLabel=""
			linkTo="/sign-in"
		>
			<div className="text-sm text-muted-foreground">
				Redirecting you to the workspace...
			</div>
		</AuthFormLayout>
	);
}
