import { createServerFn } from "@tanstack/react-start";
import { env } from "@platform/env";

export const getEmailConfig = createServerFn().handler(async () => {
	return {
		emailEnabled: !!env.RESEND_API_KEY,
	};
});
