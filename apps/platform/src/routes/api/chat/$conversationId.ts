import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@platform/lib/auth";
import { authMiddleware } from "@platform/middleware/auth";
import { convertToModelMessages, type UIMessage, type ToolSet } from "ai";
import {
	getProviderModel,
	createTools,
	isSystemAgentId,
	getSystemAgent,
	getDefaultProvider,
	getDefaultModelForProvider,
	DEFAULT_SYSTEM_AGENT_ID,
	runAgent,
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
import * as Sentry from "@sentry/tanstackstart-react";

const requestSchema = z.object({
	messages: z.array(z.any()),
	agentId: z.string().optional(),
	modelId: z.string().optional(),
	modelProvider: z.enum(SUPPORTED_PROVIDERS).optional(),
	searchProvider: z.enum(["firecrawl", "webfetch"]).optional(),
	webSearchEnabled: z.boolean().optional(),
	fileSearchEnabled: z.boolean().optional(),
	fileIds: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/api/chat/$conversationId")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			POST: async (ctx) =>
				Sentry.startSpan(
					{ name: "POST /api/chat/$conversationId" },
					async () => {
						const { request, params } = ctx;
						const conversationId = params.conversationId;

						try {
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
								searchProvider?: "firecrawl" | "webfetch";
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
									{
										status: 400,
										headers: { "Content-Type": "application/json" },
									}
								);
							}

							const agentId = body.agentId ?? DEFAULT_SYSTEM_AGENT_ID;
							const isSystemAgent = isSystemAgentId(agentId);
							const systemAgent = isSystemAgent
								? getSystemAgent(agentId)
								: null;

							if (isSystemAgent && !systemAgent) {
								return new Response(
									JSON.stringify({ error: "Agent not found" }),
									{
										status: 404,
										headers: { "Content-Type": "application/json" },
									}
								);
							}

							const dbAgent = isSystemAgent
								? null
								: await getAgentById(agentId);

							if (!systemAgent && !dbAgent) {
								return new Response(
									JSON.stringify({ error: "Agent not found" }),
									{
										status: 404,
										headers: { "Content-Type": "application/json" },
									}
								);
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
								? requestedModelId.split("/").slice(1).join("/") ||
									requestedModelId
								: requestedModelId;

							logger.info(`Using model: ${modelProvider}/${modelId}`, {
								conversationId,
								modelId,
								agentId,
							});

							const model = getProviderModel(modelProvider, modelId);

							const rawToolEntries = isSystemAgent
								? (systemAgent?.tools ?? []).map((t) => ({
										identifier: t.name,
										enabled: t.enabled,
										config: (t.config as Record<string, unknown>) ?? {},
									}))
								: (dbAgent?.agentTools ?? []).map((at) => ({
										identifier: at.tool?.toolKey ?? at.tool?.name ?? "unknown",
										enabled: at.enabled,
										config: (at.config as Record<string, unknown>) ?? {},
									}));

							const toolConfigs = rawToolEntries
								.filter((entry) => {
									if (!entry.enabled) return false;
									if (
										entry.identifier === "webSearch" &&
										body.webSearchEnabled === false
									)
										return false;
									if (
										entry.identifier === "fileSearch" &&
										body.fileSearchEnabled === false
									)
										return false;
									return true;
								})
								.map((entry) => {
									const config = { ...entry.config };
									if (entry.identifier === "fileSearch" && body.fileIds) {
										config.fileIds = body.fileIds;
									}
									return {
										name: entry.identifier,
										enabled: entry.enabled,
										config,
									};
								});

							const builtinTools = createTools(
								orgId,
								modelProvider,
								toolConfigs,
								{
									searchProvider: body.searchProvider ?? "firecrawl",
								}
							);

							let mcpTools: ToolSet = {};
							try {
								mcpTools = await discoverMcpTools(orgId);
							} catch {
								// MCP tools unavailable, continue with built-in tools
							}

							// Builtins take precedence — same name wins over MCP
							const tools: ToolSet = { ...mcpTools, ...builtinTools };

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

							const result = runAgent(
								{
									model,
									systemPrompt,
									messages: await convertToModelMessages(uiMessages),
									tools,
									maxToolCalls,
								},
								{
									onFinish: async ({ steps }) => {
										try {
											const toolCallHistory = steps.flatMap((step) =>
												step.toolCalls.map((tc) => {
													const toolCallId = tc.toolCallId;
													const name = tc.toolName;
													const args =
														"args" in tc
															? (tc.args as Record<string, unknown>)
															: (tc.input as Record<string, unknown>);
													const resultEntry = step.toolResults.find(
														(tr) => tr.toolCallId === toolCallId
													);
													const result =
														resultEntry && "result" in resultEntry
															? resultEntry.result
															: resultEntry && "output" in resultEntry
																? resultEntry.output
																: undefined;
													return { id: toolCallId, name, args, result };
												})
											);

											const lastStep = steps[steps.length - 1];
											const text = lastStep?.text ?? "";

											if (text || toolCallHistory.length > 0) {
												await createMessage({
													conversationId,
													role: "assistant",
													content: text,
													toolCalls:
														toolCallHistory.length > 0
															? toolCallHistory
															: undefined,
													agentId: assistantAgentId,
												});
											}
										} catch (err) {
											logger.error("Failed to save assistant message:", err);
										}
									},
								}
							);

							result.consumeStream();

							return result.toUIMessageStreamResponse();
						} catch (error) {
							logger.error("Error in chat API:", error);
							Sentry.captureException(error);
							return new Response(
								JSON.stringify({
									error: "Internal server error",
								}),
								{ status: 500, headers: { "Content-Type": "application/json" } }
							);
						}
					}
				),
		},
	},
});
