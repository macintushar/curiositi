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
  mode,
  space_id,
}: {
  input: string;
  model: string;
  provider: LLM_PROVIDERS;
  thread_id: string;
  mode: CuriositiAgentMode;
  space_id?: string;
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
    mode,
    provider,
    space_id,
    formattedHistory,
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
      documentSearches: response.docQueries,
      webSearches: response.webQueries,
      documentSearchResults: response.docResults,
      webSearchResults: response.webResults,
    },
  ]);

  return {
    data: {
      answer: response.answer,
      metadata: {
        docQueries: response.docQueries,
        webQueries: response.webQueries,
        docResults: response.docResults,
        strategy: response.strategy,
        reasoning: response.reasoning,
      },
    },
  };
}
