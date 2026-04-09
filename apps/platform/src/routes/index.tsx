import { authMiddleware } from "@platform/middleware/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	server: {
		middleware: [authMiddleware],
	},
	beforeLoad: async () => {
		throw redirect({ to: "/app" });
	},
});
