import curiositiAgent from "@/agents/curiositiAgent";
import db from "@/db";
import { messages, threads } from "@/db/schema";
import { llm } from "@/lib/llms";
import { tryCatch } from "@/lib/try-catch";
import { formatHistory } from "@/lib/utils";
import { CuriositiAgentMode, LLM_PROVIDERS, ThreadMessage } from "@/types";
import { generateText } from "ai";
import { eq } from "drizzle-orm";

export async function searchHandler({
  input,
  model,
  provider,
  thread_id,
  space_ids,
  file_ids,
}: {
  input: string;
  model: string;
  provider: LLM_PROVIDERS;
  thread_id: string;
  mode: CuriositiAgentMode;
  space_ids?: string[];
  file_ids?: string[];
}): Promise<{ data: ThreadMessage }> {
  const history = await db.query.messages.findMany({
    where: eq(messages.threadId, thread_id),
    columns: {
      role: true,
      content: true,
      documentSearches: true,
      webSearches: true,
      documentSearchResults: true,
      webSearchResults: true,
    },
  });

  const formattedHistory = formatHistory(history);

  console.log(formattedHistory, history);

  const thread = await db.query.threads.findFirst({
    where: eq(threads.id, thread_id),
    columns: {
      title: true,
    },
  });

  if (history.length === 0 || thread?.title === "Untitled") {
    console.log("Generating title");

    const generateTitle = async () => {
      const { text } = await generateText({
        model: llm(model, provider),
        system: `You are a helpful assistant that generates titles for chat threads. 
        The title should be a single sentence that captures the main idea of the chat thread. 
        Give only the title, no other text. The title should be no more than 30 characters. 
        The title should be in the same language as the message. Do not include any other text in your response. 
        Do not generate a title that is too generic or vague. Do not give more than one title.`,
        prompt: `Generate a title for a chat thread based on this message: ${input}. ${formattedHistory.length > 0 ? `The previous messages are: ${formattedHistory.map((h) => h.content).join("\n")}` : ""}`,
        maxTokens: 30,
      });
      await db
        .update(threads)
        .set({ title: text })
        .where(eq(threads.id, thread_id));

      return {
        title: text,
      };
    };

    const { data, error } = await tryCatch(generateTitle());
    if (error) {
      console.error("Error generating title: ", error);
    }

    console.log("Title generated: ", data?.title);
  }

  const response = await curiositiAgent(
    input,
    model,
    history,
    file_ids,
    space_ids,
    true,
    provider,
    {
      maxDocQueries: 5,
      maxWebQueries: 5,
      includeFollowUps: true,
      prioritizeRecent: true,
      confidenceThreshold: 0.5,
    },
  );

  const newMessage = await db
    .insert(messages)
    .values([
      {
        role: "user",
        content: input,
        threadId: thread_id,
        model,
        provider,
      },
      {
        role: "assistant",
        content: response.answer,
        threadId: thread_id,
        model,
        provider,
        documentSearches: response.contextSources.documentSpaces,
        webSearches: response.contextSources.webSearches,
        documentSearchResults: response.contextSources.documentSpaces,
        webSearchResults: response.contextSources.webSearches,
        specificFileContent: response.contextSources.specificFiles,
        confidence: response.confidence,
        followUpSuggestions: response.followUpSuggestions,
        strategy: response.strategy,
        reasoning: response.reasoning,
      },
    ])
    .returning();

  return {
    data: {
      id: newMessage[1].id,
      createdAt: newMessage[1].createdAt,
      updatedAt: newMessage[1].updatedAt,
      content: response.answer,
      role: "assistant",
      threadId: thread_id,
      documentSearches: response.contextSources.documentSpaces,
      webSearches: response.contextSources.webSearches,
      documentSearchResults: response.contextSources.documentSpaces,
      webSearchResults: response.contextSources.webSearches,
      specificFileContent: response.contextSources.specificFiles,
      model,
      provider,
      strategy: response.strategy,
      reasoning: response.reasoning,
      confidence: response.confidence,
      followUpSuggestions: response.followUpSuggestions,
    },
  };
}
