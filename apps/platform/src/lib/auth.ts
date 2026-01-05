import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { env } from "@/env";
import client from "@curiositi/db/client";

export const auth = betterAuth({
	plugins: [organization()],
	database: drizzleAdapter(client, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
			redirectURI: "http://localhost:3000/api/auth/callback/github",
		},
	},
});

export type Session = typeof auth.$Infer.Session;
