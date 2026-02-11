import FormField from "@platform/components/ui/form-field";
import PasswordField from "@platform/components/ui/password-field";
import { Button } from "@platform/components/ui/button";

import { useNavigate } from "@tanstack/react-router";
import AuthFormLayout from "@platform/layouts/auth-form-layout";
import { useForm } from "@tanstack/react-form";
import { signUpSchema } from "@curiositi/share/schemas";

import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";

export default function SignUp() {
	const navigate = useNavigate();
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: signUpSchema,
		},
		onSubmit: async ({ value }) => {
			const res = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});
			if (res.error) {
				toast.error(res.error.message);
			}
			if (res.data) {
				toast.success("Signed up successfully");
				navigate({ to: "/onboarding" });
			}
		},
	});

	return (
		<AuthFormLayout
			title="Sign up for Curiositi"
			subtitle="Create your account to access curiositi"
			onSubmit={() => form.handleSubmit()}
			submitButton={<Button type="submit">Sign Up</Button>}
			linkText="Already have an account?"
			linkLabel="Sign in"
			linkTo="/sign-in"
		>
			<form.Field
				name="name"
				children={(field) => (
					<FormField
						field={field}
						label="Name"
						inputType="text"
						placeholder="Mac"
						autoComplete="name"
					/>
				)}
			/>
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
