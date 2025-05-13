import curiositiAgent from "@/agents/curiositiAgent";
import { QuerySchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const queryRouter = new Hono();

queryRouter.post("/", zValidator("json", QuerySchema), async (c) => {
  const { input, model, space_id } = c.req.valid("json");

  const response = await curiositiAgent(input, model, "space", space_id);

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
});

queryRouter.post(
  "/general",
  zValidator("json", QuerySchema.omit({ space_id: true })),
  async (c) => {
    const { input, model } = c.req.valid("json");

    const response = await curiositiAgent(input, model, "general");

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
  },
);

export default queryRouter;
