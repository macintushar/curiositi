import { OllamaChat } from "@/tools/chat";
import { AgentExecutor, createReactAgent } from "langchain/agents";

import { webSearchTool } from "@/tools/webSearch";
import { docSearchTool } from "@/tools/docSearch";
import { PostgresChatMessageHistory } from "@langchain/community/stores/message/postgres";
import { db } from "@/services/db";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { CHAT_PROMPT } from "@/constants";

const agentTools = [webSearchTool, docSearchTool];

export default async function queryAgent(
  input: string,
  model: string,
  sessionId: string
) {
  const chatModel = OllamaChat(model);

  const postgresMessageHistory = new PostgresChatMessageHistory({
    sessionId: sessionId,
    pool: db,
  });

  const prompt = CHAT_PROMPT;

  const agent = await createReactAgent({
    llm: chatModel,
    tools: agentTools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools: agentTools,
    verbose: true,
    handleParsingErrors: true,
    maxIterations: 3,
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
