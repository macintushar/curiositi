import { createMiddleware } from "@tanstack/react-start";
import { env } from "@platform/env";

export const emailMiddleware = createMiddleware().server(async ({ next }) => {
	return next({
		context: {
			emailEnabled: !!env.RESEND_API_KEY,
		},
	});
});
