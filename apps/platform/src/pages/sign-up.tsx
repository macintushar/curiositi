import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@platform/components/ui/field";
import { Input } from "@platform/components/ui/input";
import { Button } from "@platform/components/ui/button";

import { Link, useNavigate } from "@tanstack/react-router";
import AuthLayout from "@platform/layouts/auth-layout";
import { useForm } from "@tanstack/react-form";
import { signUpSchema } from "@curiositi/share/schemas";

import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import HiddenInput from "@platform/components/ui/hidden-input";
import GoogleAuth from "@platform/components/google-auth";

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
			// Do something with form data
			const res = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});
			console.log("here");

			console.log(res);
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
		<AuthLayout>
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="text-2xl font-bold">Sign up for Curiositi</h1>
						<p className="text-muted-foreground text-sm text-balance">
							Create your account to access curiositi
						</p>
					</div>
					<form.Field
						name="name"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Name</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="name"
										placeholder="Mac"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										autoComplete="name"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name="email"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="m@example.com"
										autoComplete="email"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name="password"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<HiddenInput
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										autoComplete="current-password"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name="confirmPassword"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
									<HiddenInput
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										autoComplete="current-password"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<Field>
						<Button type="submit">Sign Up</Button>
					</Field>
					<FieldSeparator>or</FieldSeparator>
					<Field>
						<GoogleAuth />
						<FieldDescription className="text-center">
							Already have an account?{" "}
							<Link to="/sign-in" className="underline underline-offset-4">
								Sign in
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</AuthLayout>
	);
}
