import curiositiAgent from "@/agents/curiositiAgent";
import { LLM_PROVIDERS } from "@/types";

export async function searchHandler(
  input: string,
  model: string,
  space_id: string,
  provider: LLM_PROVIDERS,
) {
  const response = await curiositiAgent(
    input,
    model,
    "space",
    provider,
    space_id,
  );

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

export async function generalSearchHandler(
  input: string,
  model: string,
  provider: LLM_PROVIDERS,
) {
  const response = await curiositiAgent(input, model, "general", provider);

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
