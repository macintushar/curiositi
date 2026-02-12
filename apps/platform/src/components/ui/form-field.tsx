import type React from "react";
import { Field, FieldError, FieldLabel } from "@platform/components/ui/field";
import { Input } from "@platform/components/ui/input";

type FieldState = {
	name: string;
	state: {
		value: string;
		meta: {
			isTouched: boolean;
			isValid: boolean;
			errors: Array<{ message?: string } | undefined>;
		};
	};
	handleBlur: () => void;
	handleChange: (value: string) => void;
};

type FormFieldProps = {
	field: FieldState;
	label: string;
	className?: string;
	inputType?: string;
	placeholder?: string;
	autoComplete?: string;
	children?: (props: {
		field: FieldState;
		isInvalid: boolean;
	}) => React.ReactNode;
};

export function getFieldInvalid(field: FieldState) {
	return field.state.meta.isTouched && !field.state.meta.isValid;
}

export default function FormField({
	field,
	label,
	className,
	inputType = "text",
	placeholder,
	autoComplete,
	children,
}: FormFieldProps) {
	const isInvalid = getFieldInvalid(field);

	if (children) {
		return children({ field, isInvalid });
	}

	return (
		<Field data-invalid={isInvalid} className={className}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				type={inputType}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				aria-invalid={isInvalid}
				placeholder={placeholder}
				autoComplete={autoComplete}
			/>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}

export type { FieldState };
