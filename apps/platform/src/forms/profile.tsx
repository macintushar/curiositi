import { updateUserSchema } from "@curiositi/share/schemas";
import { Button } from "@platform/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@platform/components/ui/field";
import { Input } from "@platform/components/ui/input";
import { authClient } from "@platform/lib/auth-client";
import { handleFormSubmit } from "@platform/lib/utils";
import { IconLoader, IconLoader2, IconLoader3 } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

type ProfileFormProps = {
	defaultValues?: {
		name?: string;
	};
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const form = useForm({
		defaultValues: {
			name: defaultValues?.name || "",
		},
		validators: {
			onChange: updateUserSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				await authClient.updateUser({
					name: value.name,
				});
				setIsSubmitting(false);
			} catch (error) {
				toast.error("Something went wrong, please try again.");
			} finally {
				setIsSubmitting(false);
			}
		},
	});
	return (
		<form
			onSubmit={handleFormSubmit(() => form.handleSubmit())}
			className="flex items-end gap-2 w-full"
		>
			<FieldGroup>
				<form.Field
					name="name"
					children={(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
									placeholder="Add your display name"
									autoComplete="name"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>
			<Button className="w-16" type="submit" disabled={isSubmitting}>
				{isSubmitting ? <IconLoader2 className="animate-spin" /> : "Save"}
			</Button>
		</form>
	);
}
