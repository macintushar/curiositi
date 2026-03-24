import { Resend } from "resend";

interface SendPasswordResetParams {
	to: string;
	resetUrl: string;
	apiKey: string;
	fromAddress: string;
}

interface SendInvitationParams {
	to: string;
	workspaceName: string;
	inviteUrl: string;
	inviterName: string;
	apiKey: string;
	fromAddress: string;
}

export async function sendPasswordResetEmail({
	to,
	resetUrl,
	apiKey,
	fromAddress,
}: SendPasswordResetParams): Promise<void> {
	const resend = new Resend(apiKey);

	await resend.emails.send({
		from: fromAddress,
		to,
		subject: "Reset your Curiositi password",
		text: `Hi,\n\nYou requested to reset your password for your Curiositi account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, you can safely ignore this email.`,
	});
}

export async function sendInvitationEmail({
	to,
	workspaceName,
	inviteUrl,
	inviterName,
	apiKey,
	fromAddress,
}: SendInvitationParams): Promise<void> {
	const resend = new Resend(apiKey);

	await resend.emails.send({
		from: fromAddress,
		to,
		subject: `You have been invited to join ${workspaceName} on Curiositi`,
		text: `Hi,\n\n${inviterName} has invited you to join ${workspaceName} on Curiositi.\n\nTo accept the invitation, first, sign in or sign up for a Curiositi account. After that, click the link below to accept the invitation:\n${inviteUrl}\n\nThis invitation will expire in 48 hours.\n\nIf you do not have an account yet, you will be prompted to create one.`,
	});
}
