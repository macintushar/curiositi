import FormField from "@platform/components/ui/form-field";
import { Button } from "@platform/components/ui/button";
import AuthFormLayout from "@platform/layouts/auth-form-layout";
import { useForm } from "@tanstack/react-form";
import { forgotPasswordSchema } from "@curiositi/share/schemas";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

export default function ForgotPassword() {
	const { emailEnabled } = useRouteContext({ from: "/forgot-password" });
	const [submitted, setSubmitted] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		validators: {
			onChange: forgotPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			const res = await authClient.requestPasswordReset({
				email: value.email,
			});

			if (res.error) {
				toast.error(res.error.message);
			} else {
				setSubmitted(true);
				toast.success("Check your email for reset instructions");
			}
		},
	});

	if (!emailEnabled) {
		return (
			<AuthFormLayout
				title="Password Reset Unavailable"
				subtitle="Email services are not configured. Please contact support."
				onSubmit={async () => {}}
				submitButton={<Button disabled>Continue</Button>}
				linkText="Remember your password?"
				linkLabel="Sign in"
				linkTo="/sign-in"
			>
				<div className="text-sm text-muted-foreground">
					Password reset functionality is currently unavailable. Please contact
					your administrator for assistance.
				</div>
			</AuthFormLayout>
		);
	}

	if (submitted) {
		return (
			<AuthFormLayout
				title="Check Your Email"
				subtitle="We've sent password reset instructions to your email"
				onSubmit={async () => {}}
				submitButton={<Button disabled>Continue</Button>}
				linkText="Remember your password?"
				linkLabel="Sign in"
				linkTo="/sign-in"
			>
				<div className="text-sm text-muted-foreground">
					If an account exists with that email, you will receive password reset
					instructions. Please check your inbox and spam folder.
				</div>
			</AuthFormLayout>
		);
	}

	return (
		<AuthFormLayout
			title="Forgot Password"
			subtitle="Enter your email to reset your password"
			onSubmit={() => form.handleSubmit()}
			submitButton={<Button type="submit">Send Reset Instructions</Button>}
			linkText="Remember your password?"
			linkLabel="Sign in"
			linkTo="/sign-in"
		>
			<form.Field
				name="email"
				children={(field) => (
					<FormField
						field={field}
						label="Email"
						inputType="email"
						placeholder="m@example.com"
						autoComplete="email"
					/>
				)}
			/>
		</AuthFormLayout>
	);
}
