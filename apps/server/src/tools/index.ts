import { SearchResult } from "@/types";
import { tool, type Tool } from "ai";
import z from "zod";
import { webSearchTool } from "./webSearch";
import { tryCatch } from "@/lib/try-catch";
import { docSearchToolWithSpaceId } from "./docSearch";

async function executeWebSearches(
  queries: string[],
  maxQueries: number,
): Promise<(SearchResult & { query?: string })[]> {
  console.log(`[SearchAgent] Executing ${queries.length} web queries`);

  const results = await Promise.allSettled(
    queries.map(async (query) => {
      const { data, error } = await tryCatch(
        webSearchTool.invoke(query, maxQueries),
      );

      if (error || !data || data.includes("No search results found")) {
        return null;
      }

      return {
        title: `Web search: ${query}`,
        content: data,
        source: "web",
        query,
      } as const;
    }),
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map(
      (r) =>
        (
          r as PromiseFulfilledResult<
            (SearchResult & { query?: string }) | null
          >
        ).value!,
    )
    .slice(0, 5);
}

async function executeDocSearches(
  queries: string[],
  spaceIds: string[],
): Promise<(SearchResult & { query?: string })[]> {
  console.log(
    `[SearchAgent] Executing ${queries.length} doc queries across ${spaceIds.length} spaces`,
  );

  const promises = spaceIds.flatMap((spaceId) =>
    queries.map(async (query) => {
      const { data, error } = await tryCatch(
        docSearchToolWithSpaceId(query, spaceId),
      );

      if (error || !data || data.includes("No relevant documents found")) {
        return null;
      }

      return {
        title: `Documents from space ${spaceId}`,
        content: data,
        source: `space:${spaceId}`,
        query,
      } as const;
    }),
  );

  const results = await Promise.allSettled(promises);

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map(
      (r) =>
        (
          r as PromiseFulfilledResult<
            (SearchResult & { query?: string }) | null
          >
        ).value!,
    )
    .slice(0, 10);
}

function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No relevant results found.";
  }

  return results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.source}`)
    .join("\n\n");
}

function buildToolJson(results: (SearchResult & { query?: string })[]) {
  return JSON.stringify({
    summary: formatSearchResults(results),
    results,
  });
}

const tools = (
  maxWebQueries: number,
  maxDocQueries: number,
  spaceIds: string[],
  enableWebSearch: boolean = true,
): Record<string, Tool<unknown, string>> => {
  const webTool: Record<string, Tool<unknown, string>> = enableWebSearch
    ? {
        search_web: tool({
          description: "Search the web for information.",
          inputSchema: z.object({
            queries: z
              .array(z.string())
              .min(1)
              .max(maxWebQueries)
              .describe(`1-${maxWebQueries} specific web search queries`),
          }),
          execute: async ({ queries }: { queries: string[] }) => {
            const results = await executeWebSearches(queries, maxWebQueries);
            return buildToolJson(results);
          },
        }),
      }
    : {};

  const docTool: Record<string, Tool<unknown, string>> = {
    search_documents: tool({
      description: "Search documents for information.",
      inputSchema: z.object({
        queries: z
          .array(z.string())
          .min(1)
          .max(maxDocQueries)
          .describe(`1-${maxDocQueries} specific document search queries`),
      }),
      execute: async ({ queries }: { queries: string[] }) => {
        const results = await executeDocSearches(queries, spaceIds);
        return buildToolJson(results);
      },
    }),
  };

  return { ...webTool, ...docTool };
};

export default tools;
