import { z } from "zod";

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
	get: protectedProcedure
		.input(z.object({ orgId: z.string() }))
		.query(async ({ input }) => {
			return await getSpaces(input.orgId);
		}),
	create: protectedProcedure
		.input(createSpaceSchema)
		.mutation(async ({ input }) => {
			return await createSpace(input);
		}),
	getFiles: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.query(async ({ input }) => {
			return await getSpaceFiles(input.spaceId);
		}),
	getById: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.query(async ({ input }) => {
			return await getSpaceById(input.spaceId);
		}),
	update: protectedProcedure
		.input(z.object({ spaceId: z.string(), input: createSpaceSchema }))
		.mutation(async ({ input }) => {
			return await updateSpace(input.spaceId, input.input);
		}),
	delete: protectedProcedure
		.input(z.object({ spaceId: z.string() }))
		.mutation(async ({ input }) => {
			return await deleteSpace(input.spaceId);
		}),
} satisfies TRPCRouterRecord;

export default spaceRouter;
