import {
	createResponse,
	enqueueFileForProcessing,
	uploadHandler,
} from "@curiositi/api-handlers";
import logger from "@curiositi/share/logger";
import { env } from "@platform/env";
import { auth } from "@platform/lib/auth";
import { authMiddleware } from "@platform/middleware/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/upload/")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async () => {
				return new Response("Hello World!");
			},
			POST: async ({ request }) => {
				const data = await request.formData();
				const file = data.get("file") as File | null;
				const spaceId = data.get("spaceId") as string | null;

				if (!file) {
					return new Response("Bad Request", { status: 400 });
				}

				const session = await auth.api.getSession({ headers: request.headers });

				if (
					!session ||
					!session.user ||
					!session.session ||
					!session.session.activeOrganizationId
				) {
					return new Response("Unauthorized", { status: 401 });
				}

				const { data: uploadData, error: uploadError } = await uploadHandler({
					file,
					userId: session.user.id,
					orgId: session.session.activeOrganizationId,
					spaceId: spaceId ?? undefined,
					s3: {
						accessKeyId: env.S3_ACCESS_KEY_ID,
						bucket: env.S3_BUCKET,
						endpoint: env.S3_ENDPOINT,
						secretAccessKey: env.S3_SECRET_ACCESS_KEY,
					},
				});

				if (uploadError) {
					logger.error("Error during file upload", uploadError);
					return new Response(
						JSON.stringify(createResponse(null, uploadError)),
						{
							status: 500,
						}
					);
				}

				if (uploadData) {
					const { data: enqueueData, error: enqueueError } =
						await enqueueFileForProcessing({
							fileId: uploadData.id,
							orgId: session.session.activeOrganizationId,
							qstashToken: env.QSTASH_TOKEN,
							workerUrl: env.WORKER_URL,
						});
					if (enqueueError) {
						logger.error("Error during file enqueue", enqueueError);
						return new Response(
							JSON.stringify(createResponse(null, enqueueError)),
							{
								status: 500,
							}
						);
					}
					return new Response(
						JSON.stringify(
							createResponse({ file: uploadData, queue: enqueueData }, null)
						),
						{ status: 200 }
					);
				}
				return new Response(
					JSON.stringify(
						createResponse({ file: uploadData, queue: null }, null)
					),
					{ status: 200 }
				);
			},
		},
	},
});
