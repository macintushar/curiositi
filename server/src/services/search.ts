import curiositiAgent from "@/agents/curiositiAgent";
import { Context } from "hono";

export async function searchHandler(c: Context) {
  const { input, model, space_id, provider } = await c.req.json();

  const response = await curiositiAgent(
    input,
    model,
    "space",
    provider,
    space_id,
  );

  return c.json({
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
  });
}

export async function generalSearchHandler(c: Context) {
  const { input, model, provider } = await c.req.json();

  const response = await curiositiAgent(input, model, "general", provider);

  return c.json({
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
  });
}
