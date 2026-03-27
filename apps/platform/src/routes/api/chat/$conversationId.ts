import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@platform/lib/auth";
import { authMiddleware } from "@platform/middleware/auth";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getProviderModel, createTools } from "@curiositi/agent";
import {
	getAgentById,
	getConversationById,
	createMessage,
} from "@curiositi/db";
import { SUPPORTED_PROVIDERS } from "@curiositi/share/models";
import logger from "@curiositi/share/logger";
import { z } from "zod";

const requestSchema = z.object({
	messages: z.array(z.any()),
	agentId: z.string().optional(),
	modelId: z.string().optional(),
	modelProvider: z.enum(SUPPORTED_PROVIDERS).optional(),
});

export const Route = createFileRoute("/api/chat/$conversationId")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async ({ request, params }) => {
				const conversationId = params.conversationId;

				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (
					!session ||
					!session.user ||
					!session.session ||
					!session.session.activeOrganizationId
				) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				const orgId = session.session.activeOrganizationId;

				const conversation = await getConversationById(conversationId);
				if (!conversation) {
					return new Response(
						JSON.stringify({ error: "Conversation not found" }),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						}
					);
				}

				if (conversation.organizationId !== orgId) {
					return new Response(JSON.stringify({ error: "Forbidden" }), {
						status: 403,
						headers: { "Content-Type": "application/json" },
					});
				}

				let body: {
					messages: UIMessage[];
					agentId?: string;
					modelId?: string;
					modelProvider?: "openai" | "google" | "anthropic" | "ollama";
				};
				try {
					const rawBody = await request.json();
					body = requestSchema.parse(rawBody);
				} catch (error) {
					logger.error("Invalid request body", error);
					return new Response(
						JSON.stringify({ error: "Invalid request body" }),
						{ status: 400, headers: { "Content-Type": "application/json" } }
					);
				}

				const agentId = body.agentId ?? conversation.agentId;

				try {
					const agent = await getAgentById(agentId);
					if (!agent) {
						return new Response(JSON.stringify({ error: "Agent not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" },
						});
					}

					if (agent.organizationId !== orgId) {
						return new Response(JSON.stringify({ error: "Forbidden" }), {
							status: 403,
							headers: { "Content-Type": "application/json" },
						});
					}

					const uiMessages = body.messages as UIMessage[];

					// Use model from request if provided, otherwise fall back to agent's model
					const requestModelProvider =
						body.modelProvider ?? agent.modelProvider;
					const requestModelId = body.modelId ?? agent.modelId;

					// Parse model ID - handle both "provider/model" and "model" formats
					const modelId = requestModelId.includes("/")
						? (requestModelId.split("/")[1] ?? requestModelId)
						: requestModelId;

					logger.info(`Using model: ${requestModelProvider}/${modelId}`, {
						conversationId,
						modelId,
						agentId,
						requestModelProvider,
						requestModelId,
					});

					const model = getProviderModel(requestModelProvider, modelId);

					const toolConfigs = agent.agentTools
						.filter((at) => at.enabled)
						.map((at) => ({
							name: at.tool?.name ?? "unknown",
							enabled: at.enabled,
							config: (at.config as Record<string, unknown>) ?? undefined,
						}));

					const tools = createTools(orgId, agent.modelProvider, toolConfigs);

					// Get the last user message for saving
					const lastUserMessage = uiMessages[uiMessages.length - 1];
					if (lastUserMessage?.role === "user") {
						const textContent = lastUserMessage.parts
							?.filter((part) => part.type === "text")
							.map((part) => part.text)
							.join("");
						if (textContent) {
							await createMessage({
								conversationId,
								role: "user",
								content: textContent,
							}).catch((err) => {
								logger.error("Failed to save user message:", err);
							});
						}
					}

					const result = streamText({
						model,
						system: agent.systemPrompt,
						messages: await convertToModelMessages(uiMessages),
						temperature: agent.temperature ?? undefined,
						tools: Object.keys(tools).length > 0 ? tools : undefined,
						onFinish: async ({ text }) => {
							try {
								if (text) {
									await createMessage({
										conversationId,
										role: "assistant",
										content: text,
									});
								}
							} catch (err) {
								logger.error("Failed to save assistant message:", err);
							}
						},
					});

					// Consume stream to ensure onFinish runs even if client disconnects
					result.consumeStream();

					return result.toUIMessageStreamResponse();
				} catch (error) {
					logger.error("Error in chat API:", error);
					return new Response(
						JSON.stringify({
							error:
								error instanceof Error
									? error.message
									: "Internal server error",
						}),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},
	},
});
