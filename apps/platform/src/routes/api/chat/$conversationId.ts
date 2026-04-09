import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@platform/lib/auth";
import { authMiddleware } from "@platform/middleware/auth";
import {
	streamText,
	convertToModelMessages,
	type UIMessage,
	stepCountIs,
} from "ai";
import {
	getProviderModel,
	createTools,
	isSystemAgentId,
	getSystemAgent,
	getDefaultProvider,
	getDefaultModelForProvider,
	DEFAULT_SYSTEM_AGENT_ID,
} from "@curiositi/agent";
import { discoverMcpTools } from "@curiositi/agent/mcp";
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
	searchProvider: z.enum(["firecrawl", "exa", "webfetch"]).optional(),
	webSearchEnabled: z.boolean().optional(),
	fileSearchEnabled: z.boolean().optional(),
	fileIds: z.array(z.string()).optional(),
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

				if (!session?.user || !session.session?.activeOrganizationId) {
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
					searchProvider?: "firecrawl" | "exa" | "webfetch";
					webSearchEnabled?: boolean;
					fileSearchEnabled?: boolean;
					fileIds?: string[];
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

				try {
					const agentId = body.agentId ?? DEFAULT_SYSTEM_AGENT_ID;
					const isSystemAgent = isSystemAgentId(agentId);
					const systemAgent = isSystemAgent ? getSystemAgent(agentId) : null;

					if (isSystemAgent && !systemAgent) {
						return new Response(JSON.stringify({ error: "Agent not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" },
						});
					}

					const dbAgent = isSystemAgent ? null : await getAgentById(agentId);

					if (!systemAgent && !dbAgent) {
						return new Response(JSON.stringify({ error: "Agent not found" }), {
							status: 404,
							headers: { "Content-Type": "application/json" },
						});
					}

					if (dbAgent && dbAgent.organizationId !== orgId) {
						return new Response(JSON.stringify({ error: "Forbidden" }), {
							status: 403,
							headers: { "Content-Type": "application/json" },
						});
					}

					const uiMessages = body.messages as UIMessage[];

					const inferredProviderFromModel = body.modelId?.includes("/")
						? (body.modelId.split("/")[0] ?? "")
						: "";
					const providerCandidate =
						body.modelProvider ||
						inferredProviderFromModel ||
						getDefaultProvider();

					if (
						!SUPPORTED_PROVIDERS.includes(
							providerCandidate as (typeof SUPPORTED_PROVIDERS)[number]
						)
					) {
						return new Response(
							JSON.stringify({ error: "Invalid model provider" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const modelProvider =
						providerCandidate as (typeof SUPPORTED_PROVIDERS)[number];
					const defaultModelForProvider =
						getDefaultModelForProvider(modelProvider);
					const requestedModelId = body.modelId ?? defaultModelForProvider;

					if (!requestedModelId) {
						return new Response(
							JSON.stringify({ error: "Model not selected" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const modelId = requestedModelId.includes("/")
						? requestedModelId.split("/").slice(1).join("/") || requestedModelId
						: requestedModelId;

					logger.info(`Using model: ${modelProvider}/${modelId}`, {
						conversationId,
						modelId,
						agentId,
					});

					const model = getProviderModel(modelProvider, modelId);

					const toolConfigs = isSystemAgent
						? (systemAgent?.tools ?? []).map((t) => ({
								name: t.name,
								enabled: t.enabled,
								config: t.config,
							}))
						: (dbAgent?.agentTools ?? [])
								.filter((at) => {
									const toolIdentifier = at.tool?.toolKey ?? at.tool?.name;
									if (!at.enabled) return false;
									if (
										toolIdentifier === "webSearch" &&
										body.webSearchEnabled === false
									)
										return false;
									if (
										toolIdentifier === "fileSearch" &&
										body.fileSearchEnabled === false
									)
										return false;
									return true;
								})
								.map((at) => {
									const toolIdentifier =
										at.tool?.toolKey ?? at.tool?.name ?? "unknown";
									const config = (at.config as Record<string, unknown>) ?? {};
									if (toolIdentifier === "fileSearch" && body.fileIds) {
										config.fileIds = body.fileIds;
									}
									return {
										name: toolIdentifier,
										enabled: at.enabled,
										config,
									};
								});

					const tools = createTools(orgId, modelProvider, toolConfigs, {
						searchProvider: body.searchProvider ?? "firecrawl",
					});

					const systemPrompt =
						systemAgent?.systemPrompt ?? dbAgent?.systemPrompt;
					const maxToolCalls =
						systemAgent?.maxToolCalls ?? dbAgent?.maxToolCalls ?? 10;
					const assistantAgentId = systemAgent?.id ?? dbAgent?.id;

					if (!systemPrompt || !assistantAgentId) {
						return new Response(
							JSON.stringify({ error: "Agent configuration is invalid" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					try {
						const mcpTools = await discoverMcpTools(orgId);
						Object.assign(tools, mcpTools);
					} catch {
						// MCP tools unavailable, continue with built-in tools
					}

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
						system: systemPrompt,
						messages: await convertToModelMessages(uiMessages),
						tools: Object.keys(tools).length > 0 ? tools : undefined,
						stopWhen: stepCountIs(maxToolCalls),
						onFinish: async ({ text }) => {
							try {
								if (text) {
									await createMessage({
										conversationId,
										role: "assistant",
										content: text,
										agentId: assistantAgentId,
									});
								}
							} catch (err) {
								logger.error("Failed to save assistant message:", err);
							}
						},
					});

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
