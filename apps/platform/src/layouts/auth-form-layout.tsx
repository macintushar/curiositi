import type React from "react";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
} from "@platform/components/ui/field";
import AuthLayout from "@platform/layouts/auth-layout";
import GoogleAuth from "@platform/components/google-auth";
import { Link } from "@tanstack/react-router";
import { handleFormSubmit } from "@platform/lib/utils";

type AuthFormLayoutProps = {
	title: string;
	subtitle: string;
	onSubmit: () => void;
	submitButton: React.ReactNode;
	linkText: string;
	linkLabel: string;
	linkTo: "/sign-in" | "/sign-up";
	googleAuthProps?: { isLastUsed?: boolean };
	children: React.ReactNode;
};

export default function AuthFormLayout({
	title,
	subtitle,
	onSubmit,
	submitButton,
	linkText,
	linkLabel,
	linkTo,
	googleAuthProps,
	children,
}: AuthFormLayoutProps) {
	return (
		<AuthLayout>
			<form
				className="flex flex-col gap-6"
				onSubmit={handleFormSubmit(onSubmit)}
			>
				<FieldGroup>
					<div className="flex flex-col items-center gap-1 text-center">
						<h1 className="text-2xl font-bold">{title}</h1>
						<p className="text-muted-foreground text-sm text-balance">
							{subtitle}
						</p>
					</div>
					{children}
					<Field>{submitButton}</Field>
					<FieldSeparator>or</FieldSeparator>
					<Field>
						<GoogleAuth {...googleAuthProps} />
						<FieldDescription className="text-center">
							{linkText}{" "}
							<Link to={linkTo} className="underline underline-offset-4">
								{linkLabel}
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</AuthLayout>
	);
}
