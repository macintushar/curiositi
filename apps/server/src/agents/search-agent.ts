import { streamText, CoreMessage } from "ai";
import { llm } from "@/lib/llms";
import {
  LLM_PROVIDERS,
  Message as HistoryMessage,
} from "@curiositi/share/types";
import { User } from "better-auth/*";
import tools from "@/tools";
import db from "@/db";

import { messages as messagesTable } from "@/db/schema";

export type SpaceMetadata = {
  id: string;
  name: string;
  description?: string;
  fileCount?: number;
};

export type SearchAgentConfig = {
  input: string;
  modelName: string;
  history: HistoryMessage[];
  spaces: SpaceMetadata[];
  enableWebSearch: boolean;
  provider: LLM_PROVIDERS;
  user: User;
  userTime: string;
  threadId: string;
  maxDocQueries?: number;
  maxWebQueries?: number;
};

const SEARCH_AGENT_SYSTEM_PROMPT = `You are an AI assistant for Curiositi, an AI-powered knowledge platform.

You have access to search tools to find information when needed. Use them intelligently:

AVAILABLE TOOLS:
- search_documents: Search user's uploaded documents (use when they reference "my files", space names, or need their data)
- search_web: Search the internet (may be disabled by settings; use for current events, external info, or when docs don't have the answer)

WHEN TO SEARCH:
- User explicitly mentions their files/documents/spaces
- Question requires specific data likely in their uploads
- Need current/external information not in documents
- Comparing internal data with external sources

WHEN NOT TO SEARCH:
- Simple greetings, chitchat, or clarifications
- Basic calculations or definitions you're confident about
- General knowledge questions (95%+ confidence)
- Follow-up questions already answered in conversation

TOOL OUTPUT FORMAT:
- Tools return a JSON string with shape: { "summary": string, "results": [{ "title": string, "content": string, "source": string, "query"?: string }] }
- Use the summary to inform your answer
- When citing, use [1], [2], ... where the number corresponds to the index in the combined results array across all tools, in the order received

CITATION FORMAT:
- Cite sources inline using [1], [2], [3] format throughout your response
- At the end of your response, create a "References" section
- In the References section, list each source with its number and full URL: [1](https://example.com) [2](https://another-site.com)
- Group multiple citations to the same source: [1][2][3]
- Ensure every inline citation has a corresponding entry in the References section

SEARCH STRATEGY:
- Call search tools EARLY (at start of response if needed)
- Generate 1-5 specific document queries, 1-5 web queries
- After getting results, synthesize them into your answer
- Cite sources naturally in your response using [1], [2] format
- Always include a References section at the end with full URLs
- Do not generate more than 5 queries for each tool

CRITICAL:
- Start answering immediately - don't wait to "plan"
- If you need to search, call the tool right away
- If you don't need to search, just answer directly
- Always be helpful and accurate
- Maintain context from conversation history`;

function buildUserPrompt(context: {
  user: User;
  userTime: string;
  spaces: SpaceMetadata[];
  question: string;
  history: HistoryMessage[];
}): string {
  const spacesInfo =
    context.spaces.length > 0
      ? context.spaces
          .map(
            (s) =>
              `- "${s.name}"${s.fileCount ? ` (${s.fileCount} files)` : ""}${s.description ? `: ${s.description}` : ""}`,
          )
          .join("\n")
      : "No document spaces available.";

  return `User: ${context.user.name} (Timezone: ${context.userTime})

Available document spaces (${context.spaces.length}):
${spacesInfo}

${context.question}`;
}

export async function executeSearchAgent(config: SearchAgentConfig) {
  const startTime = Date.now();
  const {
    input,
    modelName,
    history = [],
    spaces = [],
    enableWebSearch = true,
    provider = LLM_PROVIDERS.OPENAI,
    user,
    userTime,
    threadId,
    maxDocQueries = 5,
    maxWebQueries = 5,
  } = config;

  console.log(`[SearchAgent] Starting agent execution`, {
    timestamp: new Date().toISOString(),
    modelName,
    provider,
    input: input.substring(0, 100) + (input.length > 100 ? "..." : ""),
    historyLength: history.length,
    spacesCount: spaces.length,
    enableWebSearch,
  });

  const userPrompt = buildUserPrompt({
    user,
    userTime,
    spaces,
    question: input,
    history,
  });

  const messages: CoreMessage[] = [
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: userPrompt },
  ];

  console.log(
    `[SearchAgent] Starting stream (time to start: ${Date.now() - startTime}ms)`,
  );

  const result = streamText({
    model: llm(modelName, provider),
    system: SEARCH_AGENT_SYSTEM_PROMPT,
    messages,
    tools: tools(maxWebQueries, maxDocQueries, spaces.map((s) => s.id), enableWebSearch),
    temperature: 0.6,
  });

  // Process the stream asynchronously to save messages to DB
  (async () => {
    try {
      const {
        text,
        usage,
        toolResults,
        toolCalls,
        finishReason,
        reasoning,
        response: responseMetadata,
      } = await result;

      // Await all Promise-based return values
      const [
        resolvedText,
        resolvedUsage,
        resolvedToolResults,
        resolvedToolCalls,
        resolvedFinishReason,
        resolvedReasoning,
      ] = await Promise.all([
        text,
        usage,
        toolResults,
        toolCalls,
        finishReason,
        reasoning,
      ]);

      console.log(`[SearchAgent] Stream finished - Reason: ${resolvedFinishReason}`);

      // Parse tool results into structured sources
      const parsedSources: Array<{
        title: string;
        content: string;
        source: string;
        query?: string;
      }> = [];

      try {
        if (Array.isArray(resolvedToolResults)) {
          for (const tr of resolvedToolResults) {
            // AI SDK returns tool results with a `result` field
            let payload: unknown = tr;
            if (
              tr &&
              typeof tr === "object" &&
              "result" in tr
            ) {
              payload = tr.result;
            }

            if (typeof payload === "string") {
              try {
                const obj = JSON.parse(payload);
                if (obj && Array.isArray(obj.results)) {
                  for (const r of obj.results) {
                    if (
                      r &&
                      typeof r.title === "string" &&
                      typeof r.content === "string" &&
                      typeof r.source === "string"
                    ) {
                      parsedSources.push({
                        title: r.title,
                        content: r.content,
                        source: r.source,
                        query:
                          typeof r.query === "string" ? r.query : undefined,
                      });
                    }
                  }
                }
              } catch {
                // ignore JSON parse errors
              }
            }
          }
        }
      } catch {
        // swallow any parsing issues
      }

      await db.insert(messagesTable).values([
        {
          role: "user",
          content: input,
          provider,
          model: modelName,
          threadId: threadId,
        },
        {
          role: "assistant",
          content: resolvedText,
          provider,
          model: modelName,
          threadId: threadId,
          usage: resolvedUsage,
          reasoning: resolvedReasoning,
          toolCalls: resolvedToolCalls,
          toolResults: resolvedToolResults,
          sources: parsedSources.length > 0 ? parsedSources : undefined,
          finishReason: resolvedFinishReason,
        },
      ]);
    } catch (error) {
      console.error("[SearchAgent] Stream error:", error);
    }
  })();

  return result;
}
