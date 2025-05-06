import { QUERY_JSON_STRUCTURE, STRATEGY_JSON_SCHEMA } from "@/constants";
import { queryGenPrompt, synthPrompt, strategyPrompt } from "@/lib/prompts";
import { ollama } from "@/tools/chat";
import { docSearchTool } from "@/tools/docSearch";
import { webSearchTool } from "@/tools/webSearch";

export async function curiositiAgent(input: string, model: string) {
  const strategyResp = await ollama.generate({
    model,
    prompt: strategyPrompt(input),
    format: STRATEGY_JSON_SCHEMA,
    stream: false,
    options: {
      temperature: 0.2,
    },
  });

  let strategyObj;
  try {
    strategyObj = JSON.parse(
      typeof strategyResp.response === "string"
        ? strategyResp.response
        : String(strategyResp.response),
    );
  } catch {
    throw new Error(
      "Failed to parse strategy selection from LLM: " + strategyResp.response,
    );
  }

  if (strategyObj.strategy === "direct" && strategyObj.answer) {
    return {
      docQueries: [],
      webQueries: [],
      docResults: [],
      webResults: [],
      answer: strategyObj.answer,
      strategy: "direct",
    };
  }

  const queryGenResp = await ollama.generate({
    model,
    prompt: queryGenPrompt(input),
    format: QUERY_JSON_STRUCTURE,
    stream: false,
    options: {
      temperature: 0.4,
    },
  });

  let queries;

  try {
    queries = JSON.parse(
      typeof queryGenResp.response === "string"
        ? queryGenResp.response
        : String(queryGenResp.response),
    );
  } catch {
    throw new Error(
      "Failed to parse queries from LLM: " + queryGenResp.response,
    );
  }

  const docQueries: string[] = queries.docQueries || [];
  const webQueries: string[] = queries.webQueries || [];
  const docResults: string[] = [];
  const webResults: string[] = [];

  for (const q of docQueries) {
    const res = await docSearchTool.func(q);

    docResults.push(`Query: ${q}\n${res}`);
  }

  for (const q of webQueries) {
    const res = await webSearchTool.invoke(q);
    console.log(q);
    webResults.push(
      `Query: ${q}\n${typeof res === "string" ? res : JSON.stringify(res)}`,
    );
  }

  const synthResp = await ollama.generate({
    model,
    prompt: synthPrompt(input, docResults, webResults),
    stream: false,
    options: {
      temperature: 0.6,
    },
  });

  return {
    docQueries,
    webQueries,
    docResults,
    webResults,
    answer:
      typeof synthResp.response === "string"
        ? synthResp.response
        : String(synthResp.response),
    strategy: strategyObj.strategy,
  };
}
