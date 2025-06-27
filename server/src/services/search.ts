import curiositiAgent from "@/agents/curiositiAgent";
import db from "@/db";
import { messages } from "@/db/schema";
import { formatHistory } from "@/lib/utils";
import { CuriositiAgentMode, LLM_PROVIDERS } from "@/types";
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
}) {
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

  await db.insert(messages).values([
    {
      role: "user",
      content: input,
      threadId: thread_id,
    },
    {
      role: "assistant",
      content: response.answer,
      threadId: thread_id,
      documentSearches: response.contextSources.documentSpaces,
      webSearches: response.contextSources.webSearches,
      documentSearchResults: response.contextSources.documentSpaces,
      webSearchResults: response.contextSources.webSearches,
    },
  ]);

  return {
    data: {
      answer: response.answer,
      metadata: {
        docQueries: response.contextSources.documentSpaces,
        webQueries: response.contextSources.webSearches,
        docResults: response.contextSources.documentSpaces,
        webResults: response.contextSources.webSearches,
        strategy: response.strategy,
        reasoning: response.reasoning,
      },
    },
  };
}
