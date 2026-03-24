import Notifications from "@platform/pages/notifications";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	return (
		<div className="min-h-screen">
			<div className="mx-auto px-4 py-8">
				<Notifications />
			</div>
		</div>
	);
}
