import { QuerySchema } from "@/types/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import queryAgent from "@/agents/queryAgent";

const queryRouter = new Hono();

queryRouter.post("/", zValidator("json", QuerySchema), async (c) => {
	const { input, model, session_id } = c.req.valid("json");

	try {
		const response = await queryAgent(input, model, session_id);
		return c.json({
			response: response.output,
			// You might want to add metadata about which tools were used if available from result
			metadata: {
				// Example: Add intermediate steps if needed for debugging/transparency
				// intermediate_steps: result.intermediateSteps
			},
		});
	} catch (error: any) {
		console.error("Error invoking agent:", error);
		// Provide more detailed error response
		let errorMessage = "Failed to process query with agent.";
		let errorDetails = error.message || "Unknown error";
		if (error.message?.includes("Could not parse LLM output")) {
			errorMessage =
				"Agent failed to generate a valid response or tool instruction.";
			errorDetails = error.message;
		}

		return c.json(
			{
				error: errorMessage,
				details: errorDetails,
				type: error.name || "AgentError",
			},
			500,
		);
	}
});

export default queryRouter;
