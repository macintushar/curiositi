import ForgotPassword from "@platform/pages/forgot-password";
import { createFileRoute } from "@tanstack/react-router";
import { getEmailConfig } from "@platform/server/config";

export const Route = createFileRoute("/forgot-password")({
	beforeLoad: async () => {
		const config = await getEmailConfig();
		return {
			emailEnabled: config.emailEnabled,
		};
	},
	component: ForgotPassword,
});
