import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	server: {
		handlers: {
			GET: () => redirect({ to: "/sign-in" }),
		},
	},
});
