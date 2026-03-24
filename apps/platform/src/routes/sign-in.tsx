import SignIn from "@platform/pages/sign-in";
import { createFileRoute } from "@tanstack/react-router";
import { getEmailConfig } from "@platform/server/config";

export const Route = createFileRoute("/sign-in")({
	beforeLoad: async () => {
		const config = await getEmailConfig();
		return {
			emailEnabled: config.emailEnabled,
		};
	},
	component: SignIn,
});
