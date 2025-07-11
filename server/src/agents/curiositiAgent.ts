import { generateObject, generateText, type Message as AIMessage } from "ai";

import { queryGenPrompt, synthPrompt } from "@/lib/prompts";
import { QUERY_JSON_SCHEMA, STRATEGY_JSON_SCHEMA } from "@/types/schemas";
import { docSearchToolWithSpaceId } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";
import {
  CuriositiAgentMode,
  LLM_PROVIDERS,
  Message as HistoryMessage,
} from "@/types";
import { llm } from "@/lib/llms";
import { tryCatch } from "@/lib/try-catch";

type CuriositiAgentResponse = {
  docQueries: string[];
  webQueries: string[];
  docResults: string[];
  webResults: string[];
  answer: string;
  strategy: "direct" | "retrieve" | "error";
  reasoning: string;
};

async function curiositiAgent(
  input: string,
  modelName: string,
  mode: CuriositiAgentMode,
  provider: LLM_PROVIDERS = LLM_PROVIDERS.OLLAMA,
  spaceId?: string,
  history: HistoryMessage[] = [],
): Promise<CuriositiAgentResponse> {
  const agentPromise = async (): Promise<CuriositiAgentResponse> => {
    // Validate that spaceId is provided when mode is "space"
    if (mode === "space" && !spaceId) {
      throw new Error("spaceId is required when mode is 'space'");
    }

    const llmModel = llm(modelName, provider);

    console.log(
      `User Question: ${input} | Model: ${modelName} | Provider: ${provider} | SpaceId: ${spaceId}`,
    );

    // Determine if we can answer directly or need retrieval
    const strategyMessages = [
      {
        role: "system",
        content:
          "You are a senior AI strategy planner determining the best approach to answer questions.",
      },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: "user", content: input },
    ];
    const { object: strategyObj } = await generateObject({
      model: llmModel,
      schema: STRATEGY_JSON_SCHEMA,
      messages: strategyMessages as Omit<AIMessage, "id">[],
      temperature: 0.5,
    });

    if (strategyObj.strategy === "direct" && strategyObj.answer) {
      return {
        docQueries: [],
        webQueries: [],
        docResults: [],
        webResults: [],
        answer: strategyObj.answer,
        strategy: "direct",
        reasoning: "Direct answer from model knowledge",
      };
    }

    // Generate retrieval queries - modify prompt based on mode
    const modeSpecificPrompt =
      mode === "space"
        ? queryGenPrompt(input)
        : `Given the user question: "${input}", generate up to 5 web search queries as JSON:\n{\n  "webQueries": ["..."]\n}\n
Guidelines:
- Focus on creating effective web search queries to find relevant information online.
- Ensure queries are specific enough to return useful results but not too narrow.
- If user instructs to only use the documents, explain that document search is not available in general mode.
- Output only valid JSON.`;

    const queryMessages = [
      {
        role: "system",
        content:
          "You are a search query specialist optimizing queries for different information sources.",
      },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: "user", content: modeSpecificPrompt },
    ];
    const { object: queryPlan } = await generateObject({
      model: llmModel,
      schema: QUERY_JSON_SCHEMA(mode),
      messages: queryMessages as Omit<AIMessage, "id">[],
      temperature: 0.6,
    });

    // Document search worker - only run in space mode
    const docSearchResults =
      mode === "space" && spaceId
        ? await Promise.all(
            (queryPlan.docQueries || []).map(async (query) => {
              const { data: result, error } = await tryCatch(
                docSearchToolWithSpaceId(query, spaceId),
              );
              if (error) {
                console.error(
                  `Error in doc search for query "${query}":`,
                  error,
                );
                return {
                  query,
                  result: "Error retrieving document results",
                  error: error instanceof Error ? error.message : String(error),
                };
              }
              return { query, result, error: null };
            }),
          )
        : [];

    // Web search worker with error handling
    const webSearchResults = await Promise.all(
      (queryPlan.webQueries || []).map(async (query) => {
        const { data: result, error } = await tryCatch(
          webSearchTool.invoke(query),
        );
        if (error) {
          console.error(`Error in web search for query "${query}":`, error);
          return {
            query,
            result: "Error retrieving web results",
            error: error instanceof Error ? error.message : String(error),
          };
        }
        console.log("Searching the web for query:", query);
        return {
          query,
          result: typeof result === "string" ? result : JSON.stringify(result),
          error: null,
        };
      }),
    );

    // Format results for synthesis, filtering out errors
    const formattedDocResults = docSearchResults
      .filter((item) => !item.error)
      .map((item) => `Query: ${item.query}\n${item.result}`);

    const formattedWebResults = webSearchResults
      .filter((item) => !item.error)
      .map((item) => `Query: ${item.query}\n${item.result}`);

    // If all searches failed, provide a fallback answer
    const hasQueries =
      (mode === "space" && (queryPlan.docQueries || []).length > 0) ||
      (queryPlan.webQueries || []).length > 0;

    if (
      formattedDocResults.length === 0 &&
      formattedWebResults.length === 0 &&
      hasQueries
    ) {
      return {
        docQueries: mode === "space" ? queryPlan.docQueries || [] : [],
        webQueries: queryPlan.webQueries || [],
        docResults: [],
        webResults: [],
        answer:
          "I couldn't find relevant information to answer your question accurately. Please try rephrasing your question or asking something else.",
        strategy: "retrieve",
        reasoning: "Information retrieval failed",
      };
    }

    // === SYNTHESIZER: Final Answer Generation Phase ===
    // Get the final answer
    const synthMessages = [
      {
        role: "system",
        content:
          "You are an expert at synthesizing information from multiple sources into clear, accurate answers.",
      },
      ...history.map(({ role, content }) => ({ role, content })),
      {
        role: "user",
        content: synthPrompt(input, formattedDocResults, formattedWebResults),
      },
    ];
    const { text: answer } = await generateText({
      model: llmModel,
      messages: synthMessages as Omit<AIMessage, "id">[],
      temperature: 0.7,
    });

    return {
      docQueries: mode === "space" ? queryPlan.docQueries || [] : [],
      webQueries: queryPlan.webQueries || [],
      docResults: formattedDocResults,
      webResults: formattedWebResults,
      answer,
      strategy: "retrieve",
      reasoning: "Answer synthesized from retrieved information",
    };
  };

  const { data, error } = await tryCatch<CuriositiAgentResponse, Error>(
    agentPromise(),
  );

  if (error) {
    console.error("Error in curiositiAgent:", error);
    // Create a new object with the right type
    return {
      docQueries: [],
      webQueries: [],
      docResults: [],
      webResults: [],
      answer:
        "I encountered an error while processing your question. Please try again later.",
      strategy: "error", // This is a valid value for the union type
      reasoning: error instanceof Error ? error.message : String(error),
    } as CuriositiAgentResponse; // Type assertion to ensure compatibility
  }

  return data;
}

export default curiositiAgent;
