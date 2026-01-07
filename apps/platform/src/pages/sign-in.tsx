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
import { signInSchema } from "@curiositi/share/schemas";

import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import GoogleAuth from "@platform/components/google-auth";

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
			// Do something with form data
			const res = await authClient.signIn.email({
				email: value.email,
				password: value.password,
				rememberMe: true,
			});
			console.log("here");

			console.log(res);
			if (res.error) {
				toast.error(res.error.message);
			}
			if (res?.data?.token) {
				toast.success("Login successful");
				navigate({ to: "/app" });
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
						<h1 className="text-2xl font-bold">Sign in to Curiositi</h1>
						<p className="text-muted-foreground text-sm text-balance">
							Sign in to access curiositi
						</p>
					</div>
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
									<div className="flex items-center">
										<FieldLabel htmlFor={field.name}>Password</FieldLabel>
										<Link
											to="/"
											className="ml-auto text-sm underline-offset-4 hover:underline text-black"
										>
											Forgot your password?
										</Link>
									</div>
									<Input
										id={field.name}
										name={field.name}
										type="password"
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
						<Button type="submit">Login</Button>
					</Field>
					<FieldSeparator>or</FieldSeparator>
					<Field>
						<GoogleAuth />
						<FieldDescription className="text-center">
							Don&apos;t have an account?{" "}
							<Link to="/sign-up" className="underline underline-offset-4">
								Sign up
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</AuthLayout>
	);
}
