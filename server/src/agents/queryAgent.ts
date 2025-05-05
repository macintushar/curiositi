import { OllamaChat } from "@/tools/chat";
import { AgentExecutor, createReactAgent } from "langchain/agents";

import { CHAT_PROMPT } from "@/constants";
import { db } from "@/services/db";
import { docSearchTool } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres";
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";

const agentTools = [webSearchTool, docSearchTool];

export default async function queryAgent(
  input: string,
  model: string,
  sessionId: string,
) {
  const chatModel = OllamaChat(model);

  const postgresMessageHistory = new PostgresChatMessageHistory({
    sessionId: sessionId,
    pool: db,
  });

  const agent = await createReactAgent({
    llm: chatModel,
    tools: agentTools,
    prompt: CHAT_PROMPT,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools: agentTools,
    verbose: true,
    handleParsingErrors: true,
    maxIterations: 4,
  });

  console.log(`Invoking agent with input: "${input}"`);

  const result = await agentExecutor.invoke({
    input: input,
    chat_history: await postgresMessageHistory.getMessages(),
  });

  console.log("Agent finished successfully.");

  const messages: BaseMessage[] = [
    new HumanMessage(input),
    new AIMessage(result.output),
  ];
  await postgresMessageHistory.addMessages(messages);

  return result;
}
