import {
	createResponse,
	enqueueFileForProcessing,
	uploadHandler,
} from "@curiositi/api-handlers";
import logger from "@curiositi/share/logger";
import { QUEUE_PROVIDER } from "@curiositi/share/constants";
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
				const tagsString = data.get("tags") as string | null;

				let tags: string[] | undefined;
				if (tagsString) {
					try {
						tags = JSON.parse(tagsString);
					} catch (error) {
						logger.error("Error parsing tags", error);
						return new Response("Invalid tags format", { status: 400 });
					}
				}

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
					tags,
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
					const baseParams = {
						fileId: uploadData.id,
						orgId: session.session.activeOrganizationId,
					};

					if (env.QUEUE_PROVIDER === "local") {
						const enqueueParams = {
							...baseParams,
							provider: QUEUE_PROVIDER.LOCAL as const,
							bunqueueHost: env.BUNQUEUE_HOST,
							bunqueuePort: env.BUNQUEUE_PORT,
						};
						const { data: enqueueData, error: enqueueError } =
							await enqueueFileForProcessing(enqueueParams);
						if (enqueueError) {
							logger.error("Error during file enqueue", enqueueError);
							return new Response(
								JSON.stringify(createResponse(null, enqueueError)),
								{ status: 500 }
							);
						}
						return new Response(
							JSON.stringify(
								createResponse({ file: uploadData, queue: enqueueData }, null)
							),
							{ status: 200 }
						);
					}

					if (!env.QSTASH_TOKEN || !env.WORKER_URL) {
						logger.error(
							"QSTASH_TOKEN and WORKER_URL are required when QUEUE_PROVIDER=qstash"
						);
						return new Response(
							JSON.stringify(createResponse(null, "Queue configuration error")),
							{ status: 500 }
						);
					}

					const enqueueParams = {
						...baseParams,
						provider: QUEUE_PROVIDER.QSTASH as const,
						qstashToken: env.QSTASH_TOKEN,
						workerUrl: env.WORKER_URL,
					};

					const { data: enqueueData, error: enqueueError } =
						await enqueueFileForProcessing(enqueueParams);
					if (enqueueError) {
						logger.error("Error during file enqueue", enqueueError);
						return new Response(
							JSON.stringify(createResponse(null, enqueueError)),
							{ status: 500 }
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
