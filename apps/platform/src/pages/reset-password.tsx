import PasswordField from "@platform/components/ui/password-field";
import { Button } from "@platform/components/ui/button";
import AuthFormLayout from "@platform/layouts/auth-form-layout";
import { useForm } from "@tanstack/react-form";
import { resetPasswordSchema } from "@curiositi/share/schemas";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

export default function ResetPassword() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/reset-password" });
	const [submitted, setSubmitted] = useState(false);

	const token = search.token as string | undefined;

	const form = useForm({
		defaultValues: {
			token: token || "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: {
			onChange: resetPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			if (!value.token) {
				toast.error("Invalid or missing reset token");
				return;
			}

			const res = await authClient.resetPassword({
				token: value.token,
				newPassword: value.newPassword,
			});

			if (res.error) {
				toast.error(res.error.message);
			} else {
				setSubmitted(true);
				toast.success("Password reset successful");
				setTimeout(() => {
					navigate({ to: "/sign-in" });
				}, 2000);
			}
		},
	});

	if (!token) {
		return (
			<AuthFormLayout
				title="Invalid Reset Link"
				subtitle="This password reset link is invalid or has expired"
				onSubmit={async () => {}}
				submitButton={<Button disabled>Continue</Button>}
				linkText="Need to reset your password?"
				linkLabel="Request new link"
				linkTo="/forgot-password"
			>
				<div className="text-sm text-muted-foreground">
					Please request a new password reset link to continue.
				</div>
			</AuthFormLayout>
		);
	}

	if (submitted) {
		return (
			<AuthFormLayout
				title="Password Reset Successful"
				subtitle="Your password has been reset successfully"
				onSubmit={async () => {}}
				submitButton={<Button disabled>Continue</Button>}
				linkText="Ready to sign in?"
				linkLabel="Sign in"
				linkTo="/sign-in"
			>
				<div className="text-sm text-muted-foreground">
					Redirecting you to the sign in page...
				</div>
			</AuthFormLayout>
		);
	}

	return (
		<AuthFormLayout
			title="Reset Password"
			subtitle="Enter your new password"
			onSubmit={() => form.handleSubmit()}
			submitButton={<Button type="submit">Reset Password</Button>}
			linkText="Remember your password?"
			linkLabel="Sign in"
			linkTo="/sign-in"
		>
			<form.Field
				name="newPassword"
				children={(field) => (
					<PasswordField
						field={field}
						label="New Password"
						autoComplete="new-password"
					/>
				)}
			/>
			<form.Field
				name="confirmPassword"
				children={(field) => (
					<PasswordField
						field={field}
						label="Confirm Password"
						autoComplete="new-password"
					/>
				)}
			/>
		</AuthFormLayout>
	);
}
