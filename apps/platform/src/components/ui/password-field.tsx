import type { ReactNode } from "react";
import { Field, FieldError, FieldLabel } from "@platform/components/ui/field";
import { getFieldInvalid } from "@platform/components/ui/form-field";
import type { FieldState } from "@platform/components/ui/form-field";
import HiddenInput from "@platform/components/ui/hidden-input";

type PasswordFieldProps = {
	field: FieldState;
	label: string;
	labelExtra?: ReactNode;
	autoComplete?: string;
};

export default function PasswordField({
	field,
	label,
	labelExtra,
	autoComplete = "current-password",
}: PasswordFieldProps) {
	const isInvalid = getFieldInvalid(field);

	return (
		<Field data-invalid={isInvalid}>
			{labelExtra ? (
				<div className="flex items-center">
					<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
					{labelExtra}
				</div>
			) : (
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			)}
			<HiddenInput
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={isInvalid}
				autoComplete={autoComplete}
			/>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
