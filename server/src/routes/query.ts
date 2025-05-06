import { QuerySchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { curiositiAgent } from "@/agents/curiositiAgent";

const queryRouter = new Hono();

// New route for testing curiositiAgent
queryRouter.post("/", zValidator("json", QuerySchema), async (c) => {
  const { input, model } = c.req.valid("json");

  try {
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
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error invoking curiositiAgent:", error);

    let errorMessage = "Failed to process query with Curiositi agent.";
    let errorDetails = "Unknown error";
    let errorType = "CuriositiAgentError";

    if (error instanceof Error) {
      errorDetails = error.message;
      errorType = error.name;

      if (error.message?.includes("Could not parse LLM output")) {
        errorMessage =
          "Curiositi agent failed to generate a valid response or tool instruction.";
      }
    } else {
      errorDetails = String(error);
    }

    return c.json(
      {
        error: {
          message: errorMessage,
          details: errorDetails,
          type: errorType,
        },
      },
      500,
    );
  }
});

export default queryRouter;
