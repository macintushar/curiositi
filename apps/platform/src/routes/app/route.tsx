import AppLayout from "@platform/layouts/app-layout";
import { authMiddleware } from "@platform/middleware/auth";
import { orgsMiddleware } from "@platform/middleware/orgs";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
	server: {
		middleware: [authMiddleware, orgsMiddleware],
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}
