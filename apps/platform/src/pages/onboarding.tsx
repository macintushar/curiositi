import { createOrgSchema } from "@curiositi/share/schemas";
import { Button } from "@platform/components/ui/button";
import { authClient } from "@platform/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@platform/components/ui/field";
import { Input } from "@platform/components/ui/input";
import { Check, X } from "lucide-react";

type BaseStepProps = {
	handleNextStep: () => void;
};

function StepOne({ name, handleNextStep }: { name: string } & BaseStepProps) {
	return (
		<div className="h-full w-full flex flex-col gap-8 items-center justify-center">
			<h1 className="text-6xl font-bold">
				👋 Hey,{" "}
				<span className="text-accent-foreground font-serif">{name}</span>
			</h1>
			<p className="text-xl font-semibold">
				Welcome to Curiositi! Let's get started.
			</p>
			<Button onClick={handleNextStep}>Get Started →</Button>
		</div>
	);
}

function StepTwo({
	userId,
	handleNextStep,
}: { userId: string } & BaseStepProps) {
	const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
		},
		validators: {
			onChange: createOrgSchema,
		},
		onSubmit: async ({ value }) => {
			if (!isSlugAvailable) {
				toast.error(
					"Slug is not available. Choose a different slug and try again."
				);
				return;
			}
			const res = await authClient.organization.create({
				name: value.name,
				slug: value.slug,
				userId,
			});

			console.log(res.data?.id);
			if (res.error) {
				toast.error(res.error.message);
			}
			if (res?.data?.id) {
				const { data, error } = await authClient.organization.setActive({
					organizationId: res.data.id,
					organizationSlug: value.slug,
				});
				if (error) {
					toast.error(error.message);
				}
				if (data?.id) {
					toast.success("Workspace created successfully");
					handleNextStep();
				}
			}
		},
	});
	return (
		<div className="h-full w-full flex flex-col gap-8 items-center justify-center">
			<div className="max-w-xl w-full h-full flex flex-col gap-8 items-center justify-center">
				<h1 className="text-4xl font-bold">Let's create a new workspace!</h1>
				<p className="text-xl text-center">
					Workspaces are the best way to organize your files and share them with
					anyone.
				</p>

				<form
					className="flex flex-col gap-6 w-full"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="text"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											autoComplete="organization"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<form.Field
							name="slug"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Workspace Slug</FieldLabel>
										<div className="flex gap-2 items-center">
											<Input
												id={field.name}
												name={field.name}
												type="text"
												className="lowercase"
												value={field.state.value}
												onBlur={field.handleBlur}
												autoCapitalize="off"
												onChange={(e) => {
													field.handleChange(e.target.value.toLowerCase());
													setIsSlugAvailable(null);
												}}
												aria-invalid={isInvalid}
											/>
											<Button
												onClick={async () => {
													const { data, error } =
														await authClient.organization.checkSlug({
															slug: field.state.value,
														});
													if (error) {
														toast.error(error.message);
														if (error.code === "SLUG_IS_TAKEN") {
															setIsSlugAvailable(false);
														}
													}
													if (data?.status) {
														setIsSlugAvailable(data.status);
														toast.success("Slug is available!");
													}
												}}
												disabled={field.state.value.length < 3}
												size="sm"
												variant={
													isSlugAvailable === false ? "destructive" : "default"
												}
												className={
													isSlugAvailable === true ? "bg-green-700" : ""
												}
												type="button"
											>
												{isSlugAvailable === false && (
													<>
														<X />
														<p>Unavailable :&#40;</p>
													</>
												)}
												{isSlugAvailable === true && (
													<>
														<Check />
														<p>Available!</p>
													</>
												)}
												{isSlugAvailable === null && <p>Check</p>}
											</Button>
										</div>
										<FieldDescription>
											Slugs are unique across Curiositi.
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<Field>
							<Button disabled={!isSlugAvailable} type="submit">
								Create Workspace
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</div>
	);
}

export default function Onboarding() {
	const session = authClient.useSession();
	const [step, setStep] = useState<number>(1);

	return (
		<div className="flex min-h-svh max-h-svh min-w-svw max-w-svw w-svw h-svh flex-col p-4 bg-accent">
			{step === 1 && (
				<StepOne
					name={session.data?.user?.name || ""}
					handleNextStep={() => setStep(2)}
				/>
			)}
			{step === 2 && (
				<StepTwo
					handleNextStep={() => setStep(3)}
					userId={session.data?.user.id || ""}
				/>
			)}
			{step === 3 && <Navigate to="/app" />}
		</div>
	);
}
