import { z } from "zod";

export const nameString = z.string().min(1, { message: "Name is required" });
export const emailString = z
  .string()
  .email({ message: "Invalid email address" });

export const emailSchema = z.object({
  email: emailString,
});

export const nameSchema = z.object({
  name: nameString,
});

export const password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" });

export const signUpSchema = z
  .object({
    name: nameString,
    email: emailString,
    password: password,
    confirmPassword: password,
    profilePicture: z.instanceof(File).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is not the same as the confirmation",
        path: ["confirmPassword"],
      });
    }
  });

export const signInSchema = z.object({
  email: emailString,
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const createSpaceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: password,
    newPassword: password,
    confirmNewPassword: password,
  })
  .superRefine((val, ctx) => {
    if (val.newPassword !== val.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password is not the same as the confirmation",
        path: ["confirmNewPassword"],
      });
    }
  });

export const SearchSchema = z.object({
  input: z.string().min(1, '"input" cannot be empty'),
  model: z.string(),
  session_id: z.string().min(1, '"session_id" cannot be empty'),
  provider: z.string(),
  thread_id: z.string(),
  space_ids: z.array(z.string()).optional(),
  file_ids: z.array(z.string()).optional(),
});
