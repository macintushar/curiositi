import { OllamaChat } from "@/tools/chat";
import { BufferMemory } from "langchain/memory";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { PromptTemplate } from "@langchain/core/prompts";

import { webSearchTool } from "@/tools/webSearch";
import { docSearchTool } from "@/tools/docSearch";

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
  inputKey: "input",
  outputKey: "output",
});

export default async function queryAgent(input: string, model: string) {
  const chatModel = OllamaChat(model);
  const tools = [webSearchTool, docSearchTool];

  const prompt = await pull<PromptTemplate>("hwchase17/react-chat");

  const agent = await createReactAgent({
    llm: chatModel,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    memory,
    verbose: true,
    handleParsingErrors: true,
    maxIterations: 3,
  });

  console.log(`Invoking agent with input: "${input}"`);

  const chatHistory = await memory.loadMemoryVariables({});

  const result = await agentExecutor.invoke({
    input: input,
    chat_history: chatHistory.chat_history || [],
  });

  console.log("Agent finished successfully.");

  const response = result.output;

  await memory.saveContext({ input: input }, { output: response });

  return result;
}
