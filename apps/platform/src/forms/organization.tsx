import { createOrgSchema } from "@curiositi/share/schemas";
import { Button } from "@platform/components/ui/button";
import { authClient } from "@platform/lib/auth-client";
import { useForm } from "@tanstack/react-form";
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

type OrganizationFormProps = {
	userId: string;
	mode: "create" | "edit";
	defaultValues?: {
		id: string;
		name: string;
		slug: string;
	};
	nextStep?: () => void;
};

export default function OrganizationForm({
	userId,
	defaultValues,
	mode = "create",
	nextStep,
}: OrganizationFormProps) {
	const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

	const form = useForm({
		defaultValues: {
			name: defaultValues?.name || "",
			slug: defaultValues?.slug || "",
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

			if (mode === "create") {
				const { data, error } = await authClient.organization.create({
					name: value.name,
					slug: value.slug,
					userId,
				});

				if (error) {
					toast.error(error.message);
				}
				if (data?.id) {
					const { data: setActiveData, error: setActiveError } =
						await authClient.organization.setActive({
							organizationId: data.id,
							organizationSlug: value.slug,
						});
					if (setActiveError) {
						toast.error(setActiveError.message);
					}
					if (setActiveData?.id) {
						toast.success("Workspace created successfully");
						nextStep?.();
					}
				}
			}
			if (mode === "edit" && defaultValues) {
				const { data, error } = await authClient.organization.update({
					data: {
						name: value.name,
						slug: value.slug,
					},
					organizationId: defaultValues.id,
				});

				if (error) {
					toast.error(error.message);
				}
				if (data?.id) {
					toast.success("Workspace updated successfully");
					nextStep?.();
				}
			}
		},
	});
	return (
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
										className={isSlugAvailable === true ? "bg-green-700" : ""}
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
	);
}
