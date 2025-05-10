import curiositiAgent from "@/agents/curiositiAgent";
import { QuerySchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const queryRouter = new Hono();

queryRouter.post("/", zValidator("json", QuerySchema), async (c) => {
  const { input, model } = c.req.valid("json");

  const response = await curiositiAgent(input, model);

  return c.json({
    data: {
      answer: response.answer,
      metadata: {
        docQueries: response.docQueries,
        webQueries: response.webQueries,
        docResults: response.docResults,
        webResults: response.webResults,
        strategy: response.strategy,
        sourcesUsed: response.sourcesUsed,
        reasoning: response.reasoning,
      },
    },
  });
});

export default queryRouter;
