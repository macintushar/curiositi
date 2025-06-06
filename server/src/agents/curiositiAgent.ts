import { generateText, generateObject, type Message as AIMessage } from "ai";
import { llm } from "@/lib/llms";
import {
  CuriositiAgentMode,
  LLM_PROVIDERS,
  Message as HistoryMessage,
} from "@/types";
import { QUERY_JSON_SCHEMA } from "@/types/schemas";
import { docSearchToolWithSpaceId } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";
import db from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tryCatch } from "@/lib/try-catch";

export type CuriositiAgentResponse = {
  contextSources: {
    documentSpaces: string[];
    specificFiles: string[];
    webSearches: string[];
  };
  reasoning: string;
  confidence: number;
  answer: string;
  followUpSuggestions: string[];
  strategy: "comprehensive" | "focused" | "hybrid" | "error";
};

export interface CuriositiAgentConfig {
  maxDocQueries?: number;
  maxWebQueries?: number;
  includeFollowUps?: boolean;
  confidenceThreshold?: number;
  prioritizeRecent?: boolean;
}

async function curiositiAgent(
  input: string,
  modelName: string,
  history: HistoryMessage[] = [],
  fileIds: string[] = [],
  spaceIds: string[] = [],
  enableWebSearch: boolean = true,
  provider: LLM_PROVIDERS = LLM_PROVIDERS.OLLAMA,
  config: CuriositiAgentConfig = {},
): Promise<CuriositiAgentResponse> {
  const {
    maxDocQueries = 3,
    maxWebQueries = 2,
    includeFollowUps = true,
    prioritizeRecent = true,
  } = config;

  const agentPromise = async (): Promise<CuriositiAgentResponse> => {
    const llmModel = llm(modelName, provider);

    // Step 1: Analyze conversation context and determine generation strategy
    const contextAnalysisPrompt = `
Analyze this conversation and question to determine the best information gathering strategy:

Conversation History:
${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Current Question: ${input}

Available Resources:
- ${spaceIds.length} document spaces
- ${fileIds.length} specific files
- Web search ${enableWebSearch ? "enabled" : "disabled"}

Determine:
1. What type of answer is needed (factual, analytical, creative, comparative)
2. Which sources would be most valuable
3. The complexity level of the response required
4. Key themes from conversation history that should inform the search
`;

    const strategyAnalysis = await generateText({
      model: llmModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing information needs and planning comprehensive research strategies.",
        },
        { role: "user", content: contextAnalysisPrompt },
      ] as Omit<AIMessage, "id">[],
      temperature: 0.3,
    });

    // Step 2: Generate optimized queries based on strategy analysis
    const queryGenerationPrompt = `
Based on this analysis: ${strategyAnalysis.text}

And the user question: "${input}"

Generate optimized search queries (max ${maxDocQueries} for documents, max ${maxWebQueries} for web).
Consider conversation context and prioritize queries that will give the most comprehensive understanding.
`;

    const { object: queryPlan } = await generateObject({
      model: llmModel,
      schema: QUERY_JSON_SCHEMA("space" as CuriositiAgentMode),
      messages: [
        {
          role: "system",
          content:
            "You are a search query optimization specialist focusing on comprehensive information gathering.",
        },
        { role: "user", content: queryGenerationPrompt },
      ] as Omit<AIMessage, "id">[],
      temperature: 0.4,
    });

    const docQueries = (queryPlan.docQueries || []).slice(0, maxDocQueries);
    const webQueries = (queryPlan.webQueries || []).slice(0, maxWebQueries);

    // Step 3: Gather information from all sources in parallel
    const informationGathering = await Promise.allSettled([
      // Document space searches
      ...spaceIds.flatMap((spaceId) =>
        docQueries.map(async (query) => {
          const { data: result, error } = await tryCatch(
            docSearchToolWithSpaceId(query, spaceId),
          );
          return {
            type: "docSpace" as const,
            spaceId,
            query,
            result: error ? `Error: ${error}` : result,
            success: !error,
          };
        }),
      ),

      // Specific file retrieval
      ...fileIds.map(async (fileId) => {
        const { data: docs, error } = await tryCatch(
          db.query.documents.findMany({
            where: eq(documents.fileId, fileId),
            columns: { filename: true, content: true, createdAt: true },
            orderBy: prioritizeRecent ? [documents.createdAt] : undefined,
          }),
        );

        if (error || !docs || docs.length === 0) {
          return {
            type: "specificFile" as const,
            fileId,
            result: `Error or no content found for file ${fileId}`,
            success: false,
          };
        }

        const content = docs
          .map((doc) => `${doc.filename}:\n${doc.content}`)
          .join("\n---\n");

        return {
          type: "specificFile" as const,
          fileId,
          result: content,
          success: true,
        };
      }),

      // Web searches (if enabled)
      ...(enableWebSearch
        ? webQueries.map(async (query) => {
            const { data: result, error } = await tryCatch(
              webSearchTool.invoke(query),
            );
            return {
              type: "webSearch" as const,
              query,
              result: error
                ? `Error: ${error}`
                : typeof result === "string"
                  ? result
                  : JSON.stringify(result),
              success: !error,
            };
          })
        : []),
    ]);

    // Step 4: Process and categorize results
    const processedResults = informationGathering
      .map((result) => (result.status === "fulfilled" ? result.value : null))
      .filter(Boolean);

    const documentSpaceResults = processedResults
      .filter((r) => r?.type === "docSpace" && r.success)
      .map((r) => {
        if (r && r.type === "docSpace") {
          return `Space ${r.spaceId} - Query: ${r.query}\n${r.result}`;
        }
        return "";
      })
      .filter(Boolean);

    const specificFileResults = processedResults
      .filter((r) => r?.type === "specificFile" && r.success)
      .map((r) => {
        if (r && r.type === "specificFile") {
          return `File ${r.fileId}:\n${r.result}`;
        }
        return "";
      })
      .filter(Boolean);

    const webSearchResults = processedResults
      .filter((r) => r?.type === "webSearch" && r.success)
      .map((r) => {
        if (r && r.type === "webSearch") {
          return `Web Query: ${r.query}\n${r.result}`;
        }
        return "";
      })
      .filter(Boolean);

    // Step 5: Build comprehensive context
    const allContext = [
      ...documentSpaceResults,
      ...specificFileResults,
      ...webSearchResults,
    ].join("\n\n---\n\n");

    // Step 6: Generate comprehensive answer with reasoning
    const generationPrompt = `
You are an expert AI assistant generating a comprehensive answer based on multiple information sources and conversation context.

Conversation History:
${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Information Gathered:
${allContext}

User Question: ${input}

Generate a comprehensive response that:
1. Synthesizes information from all available sources
2. Considers the conversation context and history
3. Provides clear reasoning for your conclusions
4. Indicates confidence level in your answer (0.0 to 1.0)
5. ${includeFollowUps ? "Suggests 2-3 relevant follow-up questions" : ""}

Format your response as:
REASONING: [Your reasoning process]
CONFIDENCE: [0.0 to 1.0]
ANSWER: [Your comprehensive answer]
${includeFollowUps ? "FOLLOW_UPS: [Numbered list of follow-up suggestions]" : ""}
`;

    const { text: generatedResponse } = await generateText({
      model: llmModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI assistant specializing in comprehensive information synthesis and generation.",
        },
        { role: "user", content: generationPrompt },
      ] as Omit<AIMessage, "id">[],
      temperature: 0.6,
    });

    // Step 7: Parse the generated response
    const reasoningMatch = generatedResponse.match(
      /REASONING:\s*([\s\S]*?)(?=CONFIDENCE:|$)/,
    );
    const reasoning = reasoningMatch?.[1]?.trim() || "Analysis completed";
    const confidenceMatch = generatedResponse.match(/CONFIDENCE:\s*([\d.]+)/);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
    const answerMatch = generatedResponse.match(
      /ANSWER:\s*([\s\S]*?)(?=FOLLOW_UPS:|$)/,
    );
    const answer = answerMatch?.[1]?.trim() || generatedResponse;

    const followUpSuggestions = includeFollowUps
      ? (
          generatedResponse.match(/FOLLOW_UPS:\s*([\s\S]*?)$/)?.[1]?.trim() ||
          ""
        )
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => line.replace(/^\d+\.\s*/, "").trim())
          .filter(Boolean)
      : [];

    // Determine strategy used
    let strategy: CuriositiAgentResponse["strategy"] = "comprehensive";
    if (
      documentSpaceResults.length === 0 &&
      webSearchResults.length === 0 &&
      specificFileResults.length === 0
    ) {
      strategy = "error";
    } else if (documentSpaceResults.length > 0 && webSearchResults.length > 0) {
      strategy = "hybrid";
    } else {
      strategy = "focused";
    }

    return {
      contextSources: {
        documentSpaces: spaceIds,
        specificFiles: fileIds,
        webSearches: webQueries,
      },
      reasoning,
      confidence,
      answer,
      followUpSuggestions,
      strategy,
    };
  };

  const { data, error } = await tryCatch(agentPromise());
  if (error) {
    console.error("Error in CuriositiAgent:", error);
    return {
      contextSources: {
        documentSpaces: [],
        specificFiles: [],
        webSearches: [],
      },
      reasoning: `Error occurred: ${error instanceof Error ? error.message : String(error)}`,
      confidence: 0.0,
      answer:
        "I encountered an error while processing your request. Please try again later.",
      followUpSuggestions: [],
      strategy: "error",
    };
  }

  return data!;
}

export default curiositiAgent;
