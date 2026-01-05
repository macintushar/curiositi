import { z } from "zod";

import { publicProcedure, protectedProcedure } from "../init";

import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import uploadHandler from "../handlers/upload";

const uploadRouter = {
	upload: protectedProcedure
		.input(z.object({ file: z.instanceof(File) }))
		.mutation(({ ctx, input }) => {
			return uploadHandler({
				file: input.file,
				orgId: ctx.session.user.id,
				userId: ctx.session.user.id,
			});
		}),
} satisfies TRPCRouterRecord;

export default uploadRouter;
