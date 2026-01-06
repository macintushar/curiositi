import { z } from "zod";

import { protectedProcedure } from "../init";

import type { TRPCRouterRecord } from "@trpc/server";
import uploadHandler from "../handlers/upload";
import { createResponse } from "@/lib/utils";

const uploadRouter = {
	upload: protectedProcedure
		.input(z.object({ file: z.instanceof(File) }))
		.mutation(async ({ ctx, input }) => {
			const res = await uploadHandler({
				file: input.file,
				orgId: ctx.session.user.id,
				userId: ctx.session.user.id,
			});
			return createResponse(res, null);
		}),
} satisfies TRPCRouterRecord;

export default uploadRouter;
