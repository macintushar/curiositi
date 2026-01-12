import { createAuthClient } from "better-auth/react";
import {
	organizationClient,
	lastLoginMethodClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [organizationClient(), lastLoginMethodClient()],
});
