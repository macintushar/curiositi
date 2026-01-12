import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../init";

import type { TRPCRouterRecord } from "@trpc/server";
import {
	uploadHandler,
	enqueueFileForProcessing,
	createResponse,
} from "@curiositi/api-handlers";
import { env } from "@platform/env";
import logger from "@curiositi/share/logger";

const uploadRouter = {
	upload: protectedProcedure
		.input(
			z.object({ file: z.instanceof(File), spaceId: z.string().optional() })
		)
		.mutation(async ({ ctx, input }) => {
			const { data: uploadData, error: uploadError } = await uploadHandler({
				file: input.file,
				orgId: ctx.session.session.activeOrganizationId,
				userId: ctx.session.user.id,
				spaceId: input.spaceId,
				s3: {
					bucket: env.S3_BUCKET,
					accessKeyId: env.S3_ACCESS_KEY_ID,
					secretAccessKey: env.S3_SECRET_ACCESS_KEY,
					endpoint: env.S3_ENDPOINT,
				},
			});
			if (uploadError) {
				logger.error("Error during file upload", uploadError);
				return createResponse(null, uploadError);
			}

			if (uploadData) {
				const { data: enqueueData, error: enqueueError } =
					await enqueueFileForProcessing({
						fileId: uploadData?.id,
						orgId: ctx.session.session.activeOrganizationId,
						qstashToken: env.QSTASH_TOKEN,
						workerUrl: env.WORKER_URL,
					});
				if (enqueueError) {
					logger.error("Error during file enqueue", enqueueError);
					return createResponse(null, enqueueError);
				}
				return createResponse({ file: uploadData, queue: enqueueData }, null);
			}
			return createResponse({ file: uploadData, queue: null }, null);
		}),
	test: publicProcedure.query(() => {
		return "test";
	}),
} satisfies TRPCRouterRecord;

export default uploadRouter;
