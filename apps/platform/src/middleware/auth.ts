import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@platform/lib/auth";
import logger from "@curiositi/share/logger";

export const authMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const headers = getRequestHeaders();
		const session = await auth.api.getSession({ headers });
		const apiRoute = request.url.includes("/api");

		if (!session) {
			logger.info("No session found");
			if (apiRoute) return new Response("Unauthorized", { status: 401 });
			throw redirect({ to: "/sign-in" });
		}

		return await next();
	}
);
