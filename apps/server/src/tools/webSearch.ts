import { FIRECRAWL_API_KEY } from "@/constants";
import Firecrawl from "@mendable/firecrawl-js";

// Initialize Firecrawl client only if API key is available
const firecrawl = FIRECRAWL_API_KEY
  ? new Firecrawl({
      apiKey: FIRECRAWL_API_KEY,
    })
  : null;

// Create a web search tool using Firecrawl
export const webSearchTool = {
  async invoke(query: string): Promise<string> {
    // Check if Firecrawl is configured
    if (!firecrawl || !FIRECRAWL_API_KEY) {
      console.warn("Firecrawl API key not configured. Web search disabled.");
      return `Web search is not available. Please configure FIRECRAWL_API_KEY to enable web search functionality.`;
    }

    try {
      console.log(`[WebSearch] Searching for: ${query}`);

      // Use the correct Firecrawl search API
      const results = await firecrawl.search(query, {
        limit: 5,
        scrapeOptions: {
          formats: ["markdown"],
        },
      });

      console.log(`[WebSearch] Raw results: ${JSON.stringify(results)}`);

      const getField = (value: unknown, field: string): unknown =>
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)[field]
          : undefined;

      const directCandidates: unknown[] = [
        results,
        getField(results, "data"),
        getField(results, "web"),
        getField(results, "items"),
        getField(results, "results"),
      ];

      const dataField = getField(results, "data");
      const nestedCandidates: unknown[] = [
        getField(dataField, "web"),
        getField(dataField, "items"),
        getField(dataField, "results"),
        getField(dataField, "hits"),
      ];

      const candidateArrays = [...directCandidates, ...nestedCandidates];

      const hitsCandidate = candidateArrays.find(
        (value): value is Array<Record<string, unknown>> =>
          Array.isArray(value),
      );

      const hits = hitsCandidate ?? [];

      console.log(`[WebSearch] Normalized hits count: ${hits.length}`);

      if (hits.length === 0) {
        console.log(`[WebSearch] No results found for: ${query}`);
        return `No search results found for: ${query}`;
      }

      // Format the results for the agent
      const formattedResults = hits
        .map((result: Record<string, unknown>, index: number) => {
          const title =
            (result.title as string) || (result.name as string) || "Untitled";
          const url =
            (result.url as string) ||
            (result.link as string) ||
            "No URL available";
          const description =
            (result.description as string) ||
            (result.snippet as string) ||
            (result.summary as string) ||
            "No description available";

          return `${index + 1}. **${title}**
URL: ${url}
Description: ${description}`;
        })
        .join("\n\n");

      console.log(`[WebSearch] Found ${hits.length} results for: ${query}`);
      return `Search results for "${query}":\n\n${formattedResults}`;
    } catch (error) {
      console.error("[WebSearch] Firecrawl search error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes("API key") ||
          error.message.includes("authentication")
        ) {
          return `Authentication error: Please check your Firecrawl API key configuration.`;
        } else if (error.message.includes("rate limit")) {
          return `Rate limit exceeded. Please try again later.`;
        } else if (
          error.message.includes("network") ||
          error.message.includes("timeout")
        ) {
          return `Network error while searching. Please check your connection and try again.`;
        }
      }

      return `Error searching for "${query}": ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
};
