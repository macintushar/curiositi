import z from "zod";

// Space schemas
export const selectSpaceSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string().nullable(),
	icon: z.string().nullable(),
	organizationId: z.string(),
	parentSpaceId: z.string().uuid().nullable(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export const createSpaceSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string(),
	description: z.string().nullable().optional(),
	icon: z.string().nullable().optional(),
	organizationId: z.string(),
	parentSpaceId: z.string().uuid().nullable().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().nullable().optional(),
});

// File schemas
export const selectFileSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	path: z.string(),
	size: z.number().int(),
	type: z.string(),
	organizationId: z.string(),
	uploadedById: z.string(),
	status: z.enum(["pending", "processing", "completed", "failed"]),
	tags: z.unknown().nullable(),
	processedAt: z.date().nullable(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
});

export const createFileSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string(),
	path: z.string(),
	size: z.number().int(),
	type: z.string(),
	organizationId: z.string(),
	uploadedById: z.string(),
	status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
	tags: z.unknown().nullable().optional(),
	processedAt: z.date().nullable().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().nullable().optional(),
});

// Infer types from schemas
export type SelectSpace = z.infer<typeof selectSpaceSchema>;
export type CreateSpace = z.infer<typeof createSpaceSchema>;
export type SelectFile = z.infer<typeof selectFileSchema>;
export type CreateFile = z.infer<typeof createFileSchema>;
