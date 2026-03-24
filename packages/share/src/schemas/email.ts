import { z } from "zod";

export const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
	.object({
		token: z.string(),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
