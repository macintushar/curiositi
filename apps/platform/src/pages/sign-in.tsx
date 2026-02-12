import FormField from "@platform/components/ui/form-field";
import PasswordField from "@platform/components/ui/password-field";
import { Button } from "@platform/components/ui/button";

import { Link, useNavigate } from "@tanstack/react-router";
import AuthFormLayout from "@platform/layouts/auth-form-layout";
import { useForm } from "@tanstack/react-form";
import { signInSchema } from "@curiositi/share/schemas";

import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import LastUsedBadge from "@platform/components/last-used-badge";

export default function SignIn() {
	const navigate = useNavigate();
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: signInSchema,
		},
		onSubmit: async ({ value }) => {
			const res = await authClient.signIn.email({
				email: value.email,
				password: value.password,
				rememberMe: true,
			});
			if (res.error) {
				toast.error(res.error.message);
			}
			if (res?.data?.token) {
				toast.success("Login successful");
				navigate({ to: "/app" });
			}
		},
	});

	const lastUsed = authClient.getLastUsedLoginMethod();

	return (
		<AuthFormLayout
			title="Sign in to Curiositi"
			subtitle="Sign in to access curiositi"
			onSubmit={() => form.handleSubmit()}
			submitButton={
				<Button type="submit" className="relative">
					Login
					{lastUsed === "email" && <LastUsedBadge />}
				</Button>
			}
			linkText="Don't have an account?"
			linkLabel="Sign up"
			linkTo="/sign-up"
			googleAuthProps={{ isLastUsed: lastUsed === "google" }}
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
			<form.Field
				name="password"
				children={(field) => (
					<PasswordField
						field={field}
						label="Password"
						labelExtra={
							<Link
								to="/"
								className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
							>
								Forgot your password?
							</Link>
						}
					/>
				)}
			/>
		</AuthFormLayout>
	);
}
