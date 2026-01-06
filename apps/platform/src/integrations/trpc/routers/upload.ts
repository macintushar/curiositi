import { z } from "zod";

import { protectedProcedure } from "../init";

import type { TRPCRouterRecord } from "@trpc/server";
import { uploadHandler } from "@curiositi/api-handlers";
import { env } from "@platform/env";

const uploadRouter = {
	upload: protectedProcedure
		.input(z.object({ file: z.instanceof(File) }))
		.mutation(async ({ ctx, input }) => {
			const res = await uploadHandler({
				file: input.file,
				orgId: ctx.session.user.id,
				userId: ctx.session.user.id,
				s3: {
					bucket: env.S3_BUCKET,
					accessKeyId: env.S3_ACCESS_KEY_ID,
					secretAccessKey: env.S3_SECRET_ACCESS_KEY,
					endpoint: env.S3_ENDPOINT,
				},
			});
			return res;
		}),
} satisfies TRPCRouterRecord;

export default uploadRouter;
