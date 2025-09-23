import { generateObject, type Message as AIMessage } from "ai";
import { llm } from "@/lib/llms";
import {
  LLM_PROVIDERS,
  Message as HistoryMessage,
  CuriositiAgentResponse,
} from "@curiositi/share/types";
import {
  QUERY_JSON_SCHEMA,
  STRATEGY_ANALYSIS_SCHEMA,
  AGENT_RESPONSE_SCHEMA,
} from "@/types/schemas";
import { docSearchToolWithSpaceId } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";
import db from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tryCatch } from "@/lib/try-catch";
import { User } from "better-auth/*";

export type SpaceMetadata = {
  id: string;
  name: string;
  description?: string;
};

export type CuriositiAgentConfig = {
  input: string; // User's question or request
  modelName: string; // LLM model to use
  history: HistoryMessage[]; // Conversation context
  fileIds: string[]; // Specific files to analyze
  spaces: SpaceMetadata[]; // Document spaces with metadata
  enableWebSearch: boolean; // Whether to include web searches
  provider: LLM_PROVIDERS; // LLM provider (OpenAI, Anthropic, etc.)

  // Optional configuration
  maxDocQueries?: number; // Max document queries (default: 3)
  maxWebQueries?: number; // Max web queries (default: 2)
  prioritizeRecent?: boolean; // Prioritize recent documents

  user: User;
  userTime: string;
};

export default async function CuriositiAgent(
  config: CuriositiAgentConfig,
): Promise<CuriositiAgentResponse> {
  const startTime = Date.now();
  const {
    input,
    modelName,
    history = [],
    fileIds = [],
    spaces = [],
    enableWebSearch = true,
    provider = LLM_PROVIDERS.OPENAI,
    maxDocQueries = 3,
    maxWebQueries = 2,
    prioritizeRecent = true,
  } = config;

  console.log(`[CuriositiAgent] Starting agent execution`, {
    timestamp: new Date().toISOString(),
    modelName,
    provider,
    input: input.substring(0, 100) + (input.length > 100 ? "..." : ""),
    historyLength: history.length,
    fileIdsCount: fileIds.length,
    spacesCount: spaces.length,
    enableWebSearch,
    maxDocQueries,
    maxWebQueries,
  });

  const userMetadata = `
  User Metadata:
  - User's Name: ${config.user.name}
  - User Time: ${config.userTime}
  `;

  const agentPromise = async (): Promise<CuriositiAgentResponse> => {
    const llmModel = llm(modelName, provider);

    // Step 1: Context Analysis - Analyze conversation history and available resources
    console.log(`[CuriositiAgent] Step 1: Starting context analysis`);
    const step1Start = Date.now();

    const spacesInfo = spaces
      .map(
        (space) =>
          `- "${space.name}"${space.description ? ` (${space.description})` : ""} (ID: ${space.id})`,
      )
      .join("\n");

    const contextAnalysisPrompt = `
Analyze this conversation and question to determine the best information gathering strategy:

${userMetadata}

Conversation History:
${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Current Question: ${input}

Available Resources:
- ${spaces.length} document spaces:
${spacesInfo}
- ${fileIds.length} specific files: ${fileIds.join(", ")}
- Web search ${enableWebSearch ? "enabled" : "disabled"}

Determine:
1. What type of answer is needed (factual, analytical, creative, comparative)
2. Which sources would be most valuable for this specific question
3. The complexity level of the response required
4. Key themes from conversation history that should inform the search strategy
5. Whether this requires comprehensive coverage or focused expertise
6. Which spaces are most relevant based on their names and descriptions

Provide your analysis focusing on information strategy and source prioritization.
`;

    const { object: strategyAnalysis } = await generateObject({
      model: llmModel,
      schema: STRATEGY_ANALYSIS_SCHEMA,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing information needs and planning comprehensive research strategies. Focus on understanding what sources and approaches will best answer the user's question.",
        },
        { role: "user", content: contextAnalysisPrompt },
      ] as Omit<AIMessage, "id">[],
      temperature: 0.3,
    });

    const step1Duration = Date.now() - step1Start;
    console.log(`[CuriositiAgent] Step 1 completed: Context analysis`, {
      duration: `${step1Duration}ms`,
      analysis: {
        answerType: strategyAnalysis.answerType,
        complexityLevel: strategyAnalysis.complexityLevel,
        approach: strategyAnalysis.approach,
        keyThemesCount: strategyAnalysis.keyThemes.length,
        valuableSourcesCount: strategyAnalysis.valuableSources.length,
      },
    });

    // Step 2: Query Generation - Create optimized search queries based on strategy analysis
    console.log(`[CuriositiAgent] Step 2: Starting query generation`);
    const step2Start = Date.now();

    const queryGenerationPrompt = `
Based on this strategic analysis: ${JSON.stringify(strategyAnalysis)}

And the user question: "${input}"

Available spaces: ${spaces.map((s) => `"${s.name}"${s.description ? ` (${s.description})` : ""}`).join(", ")}

Generate optimized search queries (max ${maxDocQueries} for documents, max ${maxWebQueries} for web).

Guidelines:
- Document queries should target internal knowledge likely to be in uploaded files
- Web queries should focus on external, current, or supplementary information
- Consider conversation context and user intent
- Prioritize queries that will provide comprehensive understanding
- Make queries specific enough to find relevant information but broad enough to capture context
- Consider the nature of each space (name and description) when generating queries

Generate queries that will give the most complete answer to the user's question.
`;

    const { object: queryPlan } = await generateObject({
      model: llmModel,
      schema: QUERY_JSON_SCHEMA("space"),
      messages: [
        {
          role: "system",
          content:
            "You are a search query optimization specialist. Create precise, effective queries that will find the most relevant information for comprehensive answers.",
        },
        { role: "user", content: queryGenerationPrompt },
      ] as Omit<AIMessage, "id">[],
      temperature: 0.4,
    });

    const docQueries = (queryPlan.docQueries || []).slice(0, maxDocQueries);
    const webQueries = (queryPlan.webQueries || []).slice(0, maxWebQueries);

    const step2Duration = Date.now() - step2Start;
    console.log(`[CuriositiAgent] Step 2 completed: Query generation`, {
      duration: `${step2Duration}ms`,
      docQueriesGenerated: docQueries.length,
      webQueriesGenerated: webQueries.length,
      docQueries: docQueries,
      webQueries: webQueries,
    });

    // Step 3: Information Gathering - Execute searches across all available sources in parallel
    console.log(`[CuriositiAgent] Step 3: Starting information gathering`);
    const step3Start = Date.now();

    const totalSearches =
      spaces.length * docQueries.length +
      fileIds.length +
      (enableWebSearch ? webQueries.length : 0);
    console.log(
      `[CuriositiAgent] Executing ${totalSearches} parallel searches`,
      {
        docSpaceSearches: spaces.length * docQueries.length,
        fileRetrieval: fileIds.length,
        webSearches: enableWebSearch ? webQueries.length : 0,
      },
    );

    const informationGathering = await Promise.allSettled([
      // Document space searches (parallel across spaces and queries)
      ...spaces.flatMap((space) =>
        docQueries.map(async (query) => {
          const searchStart = Date.now();
          const { data: result, error } = await tryCatch(
            docSearchToolWithSpaceId(query, space.id),
          );
          const searchDuration = Date.now() - searchStart;

          console.log(`[CuriositiAgent] Doc search result`, {
            spaceId: space.id,
            spaceName: space.name,
            query: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
            success: !error,
            duration: `${searchDuration}ms`,
            error: error ? String(error).substring(0, 100) : undefined,
          });

          return {
            type: "docSpace" as const,
            spaceId: space.id,
            spaceName: space.name,
            query,
            result: error ? `Error: ${error}` : result,
            success: !error,
          };
        }),
      ),

      // Specific file retrieval (parallel across files)
      ...fileIds.map(async (fileId) => {
        const fileStart = Date.now();
        const { data: docs, error } = await tryCatch(
          db.query.documents.findMany({
            where: eq(documents.fileId, fileId),
            columns: { filename: true, content: true, createdAt: true },
            orderBy: prioritizeRecent ? [documents.createdAt] : undefined,
          }),
        );

        const fileDuration = Date.now() - fileStart;
        const success = !error && docs && docs.length > 0;

        console.log(`[CuriositiAgent] File retrieval result`, {
          fileId,
          success,
          documentsFound: success ? docs!.length : 0,
          duration: `${fileDuration}ms`,
          error: error ? String(error).substring(0, 100) : undefined,
        });

        if (!success) {
          return {
            type: "specificFile" as const,
            fileId,
            result: `Error or no content found for file ${fileId}`,
            success: false,
          };
        }

        const content = docs!
          .map((doc) => `${doc.filename}:\n${doc.content}`)
          .join("\n---\n");

        return {
          type: "specificFile" as const,
          fileId,
          result: content,
          success: true,
        };
      }),

      // Web searches (parallel across queries if enabled)
      ...(enableWebSearch
        ? webQueries.map(async (query) => {
            const webStart = Date.now();
            const { data: result, error } = await tryCatch(
              webSearchTool.invoke(query),
            );
            const webDuration = Date.now() - webStart;

            console.log(`[CuriositiAgent] Web search result`, {
              query: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
              success: !error,
              duration: `${webDuration}ms`,
              error: error ? String(error).substring(0, 100) : undefined,
            });

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

    const step3Duration = Date.now() - step3Start;

    // Step 4: Result Processing - Categorize and validate gathered information
    console.log(`[CuriositiAgent] Step 4: Processing search results`);
    const step4Start = Date.now();

    const processedResults = informationGathering
      .map((result) => (result.status === "fulfilled" ? result.value : null))
      .filter(Boolean);

    const documentSpaceResults = processedResults
      .filter((r) => r?.type === "docSpace" && r.success)
      .map((r) => {
        if (r && r.type === "docSpace") {
          return `Space "${r.spaceName}" (${r.spaceId}) - Query: ${r.query}\n${r.result}`;
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

    const step4Duration = Date.now() - step4Start;
    console.log(
      `[CuriositiAgent] Step 3-4 completed: Information gathering and processing`,
      {
        gatheringDuration: `${step3Duration}ms`,
        processingDuration: `${step4Duration}ms`,
        totalSearches,
        successfulResults: {
          documentSpaces: documentSpaceResults.length,
          specificFiles: specificFileResults.length,
          webSearches: webSearchResults.length,
        },
        failedSearches:
          totalSearches -
          (documentSpaceResults.length +
            specificFileResults.length +
            webSearchResults.length),
      },
    );

    // Step 5: Context Building - Synthesize information from multiple sources
    const allContext = [
      ...documentSpaceResults,
      ...specificFileResults,
      ...webSearchResults,
    ].join("\n\n---\n\n");

    const contextLength = allContext.length;
    console.log(`[CuriositiAgent] Step 5: Context synthesis completed`, {
      totalContextLength: contextLength,
      contextSources: {
        documentSpaces: documentSpaceResults.length,
        specificFiles: specificFileResults.length,
        webSearches: webSearchResults.length,
      },
    });

    // Step 6: Response Generation - Create comprehensive answer with reasoning
    console.log(`[CuriositiAgent] Step 6: Starting response generation`);
    const step6Start = Date.now();

    const generationPrompt = `
You are an expert AI assistant generating a comprehensive answer based on multiple information sources and conversation context.

${userMetadata}

Conversation History:
${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

Gathered Information:
${allContext}

User Question: ${input}

Strategy Analysis: ${JSON.stringify(strategyAnalysis)}

Available Spaces: ${spaces.map((s) => `"${s.name}"${s.description ? ` (${s.description})` : ""}`).join(", ")}

Generate a comprehensive response that:
1. Synthesizes information from all available sources
2. Considers the conversation context and history
3. Provides clear reasoning for your conclusions
4. Cross-references information when possible
5. Acknowledges limitations or uncertainties
6. Suggests 2-3 relevant follow-up questions that the user can ask to get more information. It needs to be from the user's perspective.

Focus on providing accurate, well-reasoned answers based on the available information.
`;

    const { object: generatedResponse } = await generateObject({
      model: llmModel,
      schema: AGENT_RESPONSE_SCHEMA,
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI assistant specializing in comprehensive information synthesis and generation. You excel at combining multiple sources to create accurate, well-reasoned responses.",
        },
        { role: "user", content: generationPrompt },
      ] as Omit<AIMessage, "id">[],
      temperature: 0.6,
    });

    const step6Duration = Date.now() - step6Start;
    console.log(`[CuriositiAgent] Step 6 completed: Response generation`, {
      duration: `${step6Duration}ms`,
      responseLength: generatedResponse.answer.length,
      reasoningLength: generatedResponse.reasoning.length,
      followUpCount: generatedResponse.followUpSuggestions.length,
    });

    // Step 7: Response Processing - Format response
    const followUpSuggestions = generatedResponse.followUpSuggestions.slice(
      0,
      3,
    );

    // Determine strategy used based on sources utilized
    let strategy: CuriositiAgentResponse["strategy"] = "comprehensive";
    if (
      documentSpaceResults.length === 0 &&
      webSearchResults.length === 0 &&
      specificFileResults.length === 0
    ) {
      strategy = "error";
    } else if (documentSpaceResults.length > 0 && webSearchResults.length > 0) {
      strategy = "hybrid";
    } else if (
      documentSpaceResults.length > 0 ||
      specificFileResults.length > 0
    ) {
      strategy = "focused";
    } else {
      strategy = "comprehensive";
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[CuriositiAgent] Execution completed successfully`, {
      totalDuration: `${totalDuration}ms`,
      strategy,
      stepTimings: {
        contextAnalysis: `${step1Duration}ms`,
        queryGeneration: `${step2Duration}ms`,
        informationGathering: `${step3Duration}ms`,
        resultProcessing: `${step4Duration}ms`,
        responseGeneration: `${step6Duration}ms`,
      },
      finalMetrics: {
        totalSearches,
        successfulSources:
          documentSpaceResults.length +
          specificFileResults.length +
          webSearchResults.length,
        contextLength,
        responseLength: generatedResponse.answer.length,
        followUpCount: followUpSuggestions.length,
      },
    });

    return {
      contextSources: {
        documentSpaces: spaces.map((s) => s.id),
        specificFiles: fileIds,
        webSearches: webQueries,
      },
      reasoning: generatedResponse.reasoning,
      answer: generatedResponse.answer,
      followUpSuggestions,
      strategy,
    };
  };

  // Execute agent with error handling
  const { data, error } = await tryCatch(agentPromise());
  if (error) {
    const totalDuration = Date.now() - startTime;
    console.error("Error in CuriositiAgent:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      totalDuration: `${totalDuration}ms`,
      config: {
        modelName,
        provider,
        input: input.substring(0, 100) + (input.length > 100 ? "..." : ""),
        historyLength: history.length,
        fileIdsCount: fileIds.length,
        spacesCount: spaces.length,
      },
    });

    return {
      contextSources: {
        documentSpaces: [],
        specificFiles: [],
        webSearches: [],
      },
      reasoning: `Error occurred during processing: ${error instanceof Error ? error.message : String(error)}`,
      answer:
        "I encountered an error while processing your request. Please try again or rephrase your question.",
      followUpSuggestions: [input],
      strategy: "error",
    };
  }

  return data!;
}
