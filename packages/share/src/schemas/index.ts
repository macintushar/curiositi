import z from "zod";

export const uploadSchema = z.object({
	file: z.instanceof(File),
});

export const signInSchema = z.object({
	email: z.email(),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const signUpSchema = z
	.object({
		name: z.string().min(1, "Name must be at least 1 character long"),
		email: z.email(),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters long"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const createOrgSchema = z.object({
	name: z.string().min(3, "Workspace Name must be at least 3 characters long"),
	slug: z.string().min(3, "Workspace Slug must be at least 3 characters long"),
});
