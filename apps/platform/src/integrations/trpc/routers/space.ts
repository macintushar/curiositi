import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../init";

import type { TRPCRouterRecord } from "@trpc/server";

import { createSpaceSchema } from "@curiositi/db/schema";
import {
	createSpace,
	getSpaces,
	getSpaceById,
	getSpaceFiles,
	updateSpace,
	deleteSpace,
} from "@curiositi/api-handlers";

const spaceRouter = {
	get: protectedProcedure.query(async ({ ctx }) => {
		return await getSpaces(ctx.session.session.activeOrganizationId);
	}),
	create: protectedProcedure
		.input(createSpaceSchema)
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
		.input(z.object({ spaceId: z.string(), input: createSpaceSchema }))
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
} satisfies TRPCRouterRecord;

export default spaceRouter;
