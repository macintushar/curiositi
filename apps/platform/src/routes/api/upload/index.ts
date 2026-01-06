import { authMiddleware } from "@platform/middleware/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/upload/")({
	server: {
		middleware: [authMiddleware],
		handlers: {
			GET: async ({ request }) => {
				return new Response("Hello World!");
			},
			POST: async ({ request }) => {
				return new Response("Hello World!");
			},
		},
	},
});
