import { z } from "zod";

const nameString = z.string().min(1, { message: "Name is required" });

export const nameSchema = z.object({
  name: nameString,
});

export const password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" });

export const signUpSchema = z
  .object({
    name: nameString,
    email: z.string().email({ message: "Invalid email address" }),
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
  email: z.string().email({ message: "Invalid email address" }),
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
