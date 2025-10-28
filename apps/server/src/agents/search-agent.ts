import { Experimental_Agent as Agent, stepCountIs } from "ai";
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

SEARCH STRATEGY:
- Call search tools EARLY (at start of response if needed)
- Generate 1-5 specific document queries, 1-5 web queries
- After getting results, synthesize them into your answer
- Cite sources naturally in your response using [1], [2] format
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

function createSearchAgent(
  modelName: string,
  provider: LLM_PROVIDERS,
  maxWebQueries: number,
  maxDocQueries: number,
  spaceIds: string[],
  enableWebSearch: boolean,
) {
  return new Agent({
    model: llm(modelName, provider),
    system: SEARCH_AGENT_SYSTEM_PROMPT,
    tools: tools(maxWebQueries, maxDocQueries, spaceIds, enableWebSearch),
    temperature: 0.6,
    stopWhen: stepCountIs(10),
  });
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

  const agent = createSearchAgent(
    modelName,
    provider,
    maxWebQueries,
    maxDocQueries,
    spaces.map((space) => space.id),
    enableWebSearch,
  );

  const userPrompt = buildUserPrompt({
    user,
    userTime,
    spaces,
    question: input,
    history,
  });

  const messages = [
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: userPrompt },
  ];

  console.log(
    `[SearchAgent] Starting stream (time to start: ${Date.now() - startTime}ms)`,
  );

  const result = agent.stream({ messages });

  (async () => {
    try {
      const [
        text,
        totalUsage,
        toolResults,
        toolCalls,
        reasoningText,
        finishReason,
      ] = await Promise.all([
        result.text,
        result.totalUsage,
        result.toolResults,
        result.toolCalls,
        result.reasoningText,
        result.finishReason,
      ]);

      console.log(`[SearchAgent] Stream finished - Reason: ${finishReason}`);

      // Attempt to parse toolResults into structured sources
      const parsedSources: Array<{ title: string; content: string; source: string; query?: string }> = [];
      try {
        if (Array.isArray(toolResults)) {
          for (const tr of toolResults as unknown[]) {
            // AI SDK may return tool results as strings or objects with an `output` field.
            let payload: unknown = tr as unknown;
            if (tr && typeof tr === "object" && (tr as any).output !== undefined) {
              payload = (tr as any).output;
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
                        query: typeof r.query === "string" ? r.query : undefined,
                      });
                    }
                  }
                }
              } catch (_) {
                // ignore JSON parse errors; tool may not have returned JSON
              }
            }
          }
        }
      } catch (_) {
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
          content: text,
          provider,
          model: modelName,
          threadId: threadId,
          usage: totalUsage,
          reasoning: reasoningText || "",
          toolCalls: toolCalls,
          toolResults: toolResults,
          sources: parsedSources.length > 0 ? parsedSources : undefined,
          finishReason,
        },
      ]);
    } catch (error) {
      console.error("[SearchAgent] Stream error:", error);
    }
  })();

  return result;
}
