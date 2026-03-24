import { createAuthClient } from "better-auth/react";
import {
	organizationClient,
	lastLoginMethodClient,
} from "better-auth/client/plugins";
import { sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
	plugins: [organizationClient(), lastLoginMethodClient(), sentinelClient()],
});
