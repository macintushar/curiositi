import { auth } from "@platform/lib/auth";
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
				const data = await request.formData();
				const file = data.get("file") as File;

				const session = await auth.api.getSession({ headers: request.headers });
				console.log(session);
				console.log(file.name);
				return new Response("Hello World POST!");
			},
		},
	},
});
