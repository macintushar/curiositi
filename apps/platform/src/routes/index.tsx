import { authMiddleware } from "@platform/middleware/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	server: {
		middleware: [authMiddleware],
	},
});
