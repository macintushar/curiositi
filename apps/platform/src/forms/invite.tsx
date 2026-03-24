import { Button } from "@platform/components/ui/button";
import { authClient } from "@platform/lib/auth-client";
import { handleFormSubmit } from "@platform/lib/utils";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";

import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@platform/components/ui/field";
import FormField from "@platform/components/ui/form-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@platform/components/ui/select";

const inviteSchema = z.object({
	email: z.email("Invalid email address"),
	role: z.enum(["member", "admin"]),
});

type InviteFormProps = {
	organizationId: string | undefined;
	onSuccess?: () => void;
};

export default function InviteForm({
	organizationId,
	onSuccess,
}: InviteFormProps) {
	const form = useForm({
		defaultValues: {
			email: "",
			role: "member" as "member" | "admin",
		},
		validators: {
			onChange: inviteSchema,
		},
		onSubmit: async ({ value }) => {
			if (!organizationId) {
				toast.error("No active organization");
				return;
			}

			const { data, error } = await authClient.organization.inviteMember({
				email: value.email,
				role: value.role,
				organizationId,
			});

			if (error) {
				toast.error(error.message);
				return;
			}

			if (data) {
				toast.success("Invitation sent successfully");
				onSuccess?.();
			}
		},
	});

	return (
		<form
			className="flex flex-col gap-6 w-full"
			onSubmit={handleFormSubmit(() => form.handleSubmit())}
		>
			<FieldGroup>
				<form.Field
					name="email"
					children={(field) => (
						<FormField
							field={field}
							label="Email"
							inputType="email"
							autoComplete="email"
							placeholder="name@email.com"
						/>
					)}
				/>
				<form.Field
					name="role"
					children={(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Role</FieldLabel>
							<Select
								value={field.state.value}
								onValueChange={(value) =>
									field.handleChange(value as "member" | "admin")
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
							{field.state.meta.errors.length > 0 && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				/>
				<Field>
					<Button type="submit" className="w-full">
						Send Invitation
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
}
