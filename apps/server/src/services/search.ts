import CuriositiAgent from "@/agents/curiositi-agent";
import db from "@/db";
import { messages, threads, spaces } from "@/db/schema";
import { llm } from "@/lib/llms";
import { tryCatch } from "@/lib/try-catch";
import { formatHistory } from "@/lib/utils";
import { LLM_PROVIDERS, ThreadMessage } from "@/types";
import { generateObject } from "ai";
import { User } from "better-auth/*";
import { eq, inArray } from "drizzle-orm";
import z from "zod";

export async function searchHandler({
  input,
  model,
  provider,
  thread_id,
  space_ids,
  file_ids,
  user,
  userTime,
}: {
  input: string;
  model: string;
  provider: LLM_PROVIDERS;
  thread_id: string;
  space_ids?: string[];
  file_ids?: string[];
  user: User;
  userTime: string;
}): Promise<{ data: ThreadMessage }> {
  const history = await db.query.messages.findMany({
    where: eq(messages.threadId, thread_id),
    columns: {
      role: true,
      content: true,
    },
  });

  const formattedHistory = formatHistory(history);

  const thread = await db.query.threads.findFirst({
    where: eq(threads.id, thread_id),
    columns: {
      title: true,
    },
  });

  if (
    thread?.title === "Untitled" ||
    thread?.title?.length === 0 ||
    thread?.title === null
  ) {
    const generateTitle = async () => {
      const titleLLM = llm("gpt-4.1-mini", LLM_PROVIDERS.OPENAI);
      const { object } = await generateObject({
        model: titleLLM,
        schema: z.object({
          title: z
            .string()
            .min(3)
            .max(50)
            .describe("The title of the chat thread"),
        }),
        system: `You are a helpful assistant that generates titles for chat threads.
        The title should be a single sentence that captures the main idea of the chat thread.
        Give only the title, no other text. The title should be no more than 30 characters.
        The title should be in the same language as the message. Do not include any other text in your response.
        Do not generate a title that is too generic or vague. Do not give more than one title.`,
        prompt: `Generate a title for a chat thread based on this message: ${input}. ${formattedHistory.length > 0 ? `The previous messages are: ${formattedHistory.map((h) => h.content).join("\n")}` : ""}`,
      });

      await db
        .update(threads)
        .set({ title: object.title.length > 0 ? object.title : "Untitled" })
        .where(eq(threads.id, thread_id));

      return {
        title: object.title.length > 0 ? object.title : "Untitled",
      };
    };

    const { error } = await tryCatch(generateTitle());
    if (error) {
      console.error("Error generating title: ", error);
    }
  }

  // Fetch space metadata if space_ids are provided
  let spaceMetadata: Array<{ id: string; name: string; description?: string }> =
    [];
  if (space_ids && space_ids.length > 0) {
    const { data: spacesData, error: spacesError } = await tryCatch(
      db.query.spaces.findMany({
        where: inArray(spaces.id, space_ids),
        columns: {
          id: true,
          name: true,
          description: true,
        },
      }),
    );

    if (spacesError) {
      console.error("Error fetching space metadata:", spacesError);
    } else {
      spaceMetadata = (spacesData || []).map((space) => ({
        id: space.id,
        name: space.name,
        description: space.description || undefined,
      }));
    }
  }

  const response = await CuriositiAgent({
    input,
    modelName: model,
    history: formattedHistory,
    fileIds: file_ids || [],
    spaces: spaceMetadata,
    enableWebSearch: true,
    provider: provider,

    // Optional configuration
    maxDocQueries: 5,
    maxWebQueries: 5,
    prioritizeRecent: true,

    user,
    userTime,
  });

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
        followUpSuggestions: response.followUpSuggestions,
        strategy: response.strategy,
        reasoning: response.reasoning,
      },
    ])
    .returning();

  return {
    data: {
      id: newMessage[1].id,
      createdAt: newMessage[1].createdAt?.toString() ?? "",
      updatedAt: newMessage[1].updatedAt?.toString() ?? "",
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
      followUpSuggestions: response.followUpSuggestions,
    },
  };
}
