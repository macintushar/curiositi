import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../init";

import type { TRPCRouterRecord } from "@trpc/server";

import {
	createSpace,
	getSpaces,
	getSpaceById,
	getSpaceWithAncestry,
	getSpaceFiles,
	updateSpace,
	deleteSpace,
	getRootSpaces,
	getChildSpaces,
	getFilesInSpace,
} from "@curiositi/api-handlers";

const spaceRouter = {
	get: protectedProcedure.query(async ({ ctx }) => {
		return await getSpaces(ctx.session.session.activeOrganizationId);
	}),
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				icon: z.string().optional(),
				parentSpaceId: z.string().uuid().nullable().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			return await createSpace({
				...input,
				organizationId: ctx.session.session.activeOrganizationId,
			});
		}),
	getFiles: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: space } = await getSpaceById(input.spaceId);
			if (
				!space?.[0] ||
				space[0].organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return await getSpaceFiles(input.spaceId);
		}),
	getById: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: space } = await getSpaceById(input.spaceId);
			if (
				!space?.[0] ||
				space[0].organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return { data: space, error: null };
		}),
	update: protectedProcedure
		.input(
			z.object({
				spaceId: z.string(),
				input: z.object({
					name: z.string().min(1).optional(),
					description: z.string().optional(),
					icon: z.string().optional(),
				}),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { data: space } = await getSpaceById(input.spaceId);
			if (
				!space?.[0] ||
				space[0].organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return await updateSpace(input.spaceId, input.input);
		}),
	delete: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const { data: space } = await getSpaceById(input.spaceId);
			if (
				!space?.[0] ||
				space[0].organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return await deleteSpace(input.spaceId);
		}),
	getRoot: protectedProcedure.query(async ({ ctx }) => {
		return await getRootSpaces(ctx.session.session.activeOrganizationId);
	}),
	getChildren: protectedProcedure
		.input(z.object({ parentSpaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: space } = await getSpaceById(input.parentSpaceId);
			if (
				!space?.[0] ||
				space[0].organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return await getChildSpaces(input.parentSpaceId);
		}),
	getFilesInSpace: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: space } = await getSpaceById(input.spaceId);
			if (
				!space?.[0] ||
				space[0].organizationId !== ctx.session.session.activeOrganizationId
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return await getFilesInSpace(input.spaceId);
		}),
	getWithAncestry: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const { data: space, error } = await getSpaceWithAncestry(input.spaceId);
			if (error || !space) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Space not found",
				});
			}
			if (space.organizationId !== ctx.session.session.activeOrganizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this space",
				});
			}
			return { data: space, error: null };
		}),
} satisfies TRPCRouterRecord;

export default spaceRouter;
