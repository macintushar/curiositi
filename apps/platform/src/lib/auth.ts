import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { env } from "@/env";
import client from "@curiositi/db/client";
import * as schema from "@curiositi/db/schema";

export const auth = betterAuth({
	plugins: [organization()],
	database: drizzleAdapter(client, {
		provider: "pg",
		schema: {
			...schema,
			user: schema.user,
		},
	}),
	trustedOrigins: ["*"],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
			redirectURI: `${env.SERVER_URL}/api/auth/callback/github`,
		},
	},
});

export type Session = typeof auth.$Infer.Session;
