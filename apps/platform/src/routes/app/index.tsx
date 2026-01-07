import AppLayout from "@platform/layouts/app-layout";
import { authMiddleware } from "@platform/middleware/auth";
import { orgsMiddleware } from "@platform/middleware/orgs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
	server: {
		middleware: [authMiddleware, orgsMiddleware],
	},
	component: RouteComponent,
});

async function RouteComponent() {
	return <AppLayout>Main App Page!</AppLayout>;
}
