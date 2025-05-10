import { generateObject, generateText } from "ai";
import { ollama } from "@/lib/llms";
import { queryGenPrompt, synthPrompt, strategyPrompt } from "@/lib/prompts";
import { docSearchTool } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";
import { QUERY_JSON_SCHEMA, STRATEGY_JSON_SCHEMA } from "@/types/schemas";

type CuriositiAgentResponse = {
  docQueries: string[];
  webQueries: string[];
  docResults: string[];
  webResults: string[];
  answer: string;
  strategy: "direct" | "retrieve";
  sourcesUsed: string[];
  reasoning: string;
};

/**
 * Utility function to extract URLs from web search results
 */
function extractUrls(text: string): string[] {
  // Pattern to match URLs - handles various URL formats including http, https
  const urlPattern = /(https?:\/\/[^\s),"]+)/g;
  const matches = text.match(urlPattern);
  return matches || [];
}

async function curiositiAgent(
  input: string,
  modelName: string,
): Promise<CuriositiAgentResponse> {
  try {
    const llmModel = ollama(modelName);

    // Determine if we can answer directly or need retrieval
    const { object: strategyObj } = await generateObject({
      model: llmModel,
      schema: STRATEGY_JSON_SCHEMA,
      system:
        "You are a senior AI strategy planner determining the best approach to answer questions.",
      prompt: strategyPrompt(input),
    });

    if (strategyObj.strategy === "direct" && strategyObj.answer) {
      return {
        docQueries: [],
        webQueries: [],
        docResults: [],
        webResults: [],
        answer: strategyObj.answer,
        strategy: "direct",
        sourcesUsed: [],
        reasoning: "Direct answer from model knowledge",
      };
    }

    // Generate retrieval queries
    const { object: queryPlan } = await generateObject({
      model: llmModel,
      schema: QUERY_JSON_SCHEMA,
      system:
        "You are a search query specialist optimizing queries for different information sources.",
      prompt: queryGenPrompt(input),
      temperature: 0.4,
    });

    // Document search worker with error handling
    const docWorker = async (queries: string[]) => {
      const results = await Promise.all(
        queries.map(async (query) => {
          try {
            const result = await docSearchTool.func(query);
            return { query, result, error: null };
          } catch (error) {
            console.error(`Error in doc search for query "${query}":`, error);
            return {
              query,
              result: "Error retrieving document results",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );
      return results;
    };

    // Web search worker with error handling
    const webWorker = async (queries: string[]) => {
      const results = await Promise.all(
        queries.map(async (query) => {
          try {
            const result = await webSearchTool.invoke(query);
            return {
              query,
              result:
                typeof result === "string" ? result : JSON.stringify(result),
              error: null,
            };
          } catch (error) {
            console.error(`Error in web search for query "${query}":`, error);
            return {
              query,
              result: "Error retrieving web results",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );
      return results;
    };

    // Execute workers in parallel
    const [docSearchResults, webSearchResults] = await Promise.all([
      docWorker(queryPlan.docQueries || []),
      webWorker(queryPlan.webQueries || []),
    ]);

    // Format results for synthesis, filtering out errors
    const formattedDocResults = docSearchResults
      .filter((item) => !item.error)
      .map((item) => `Query: ${item.query}\n${item.result}`);

    const formattedWebResults = webSearchResults
      .filter((item) => !item.error)
      .map((item) => `Query: ${item.query}\n${item.result}`);

    // If all searches failed, provide a fallback answer
    if (
      formattedDocResults.length === 0 &&
      formattedWebResults.length === 0 &&
      (queryPlan.docQueries?.length > 0 || queryPlan.webQueries?.length > 0)
    ) {
      return {
        docQueries: queryPlan.docQueries || [],
        webQueries: queryPlan.webQueries || [],
        docResults: [],
        webResults: [],
        answer:
          "I couldn't find relevant information to answer your question accurately. Please try rephrasing your question or asking something else.",
        strategy: "retrieve",
        sourcesUsed: [],
        reasoning: "Information retrieval failed",
      };
    }

    // === SYNTHESIZER: Final Answer Generation Phase ===
    // Get the final answer
    const { text: answer } = await generateText({
      model: llmModel,
      system:
        "You are an expert at synthesizing information from multiple sources into clear, accurate answers.",
      prompt: synthPrompt(input, formattedDocResults, formattedWebResults),
      temperature: 0.6,
    });

    // Extract all URLs from web results
    const webUrls: string[] = [];
    webSearchResults
      .filter((item) => !item.error)
      .forEach((item) => {
        const urls = extractUrls(item.result);
        urls.forEach((url) => webUrls.push(url));
      });

    // Get unique URLs (remove duplicates)
    const uniqueWebUrls = Array.from(new Set(webUrls));

    // Track sources used for better explainability
    const sourcesUsed = [
      // Document sources
      ...docSearchResults
        .filter((item) => !item.error)
        .map((item) => `Document: ${item.query}`),

      // Web query sources
      ...webSearchResults
        .filter((item) => !item.error)
        .map((item) => `Web Query: ${item.query}`),

      // Specific web URLs (extracted from results)
      ...uniqueWebUrls.map((url) => `Web Link: ${url}`),
    ];

    return {
      docQueries: queryPlan.docQueries || [],
      webQueries: queryPlan.webQueries || [],
      docResults: formattedDocResults,
      webResults: formattedWebResults,
      answer,
      strategy: "retrieve",
      sourcesUsed,
      reasoning: "Answer synthesized from retrieved information",
    };
  } catch (error) {
    console.error("Error in curiositiAgent:", error);
    return {
      docQueries: [],
      webQueries: [],
      docResults: [],
      webResults: [],
      answer:
        "I encountered an error while processing your question. Please try again later.",
      strategy: "direct",
      sourcesUsed: [],
      reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}

export default curiositiAgent;
