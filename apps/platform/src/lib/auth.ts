import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { lastLoginMethod } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { env } from "@platform/env";
import client from "@curiositi/db/client";
import * as schema from "@curiositi/db/schema";

export const auth = betterAuth({
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
			updateUserInfoOnLink: true,
		},
	},
	baseURL: env.SERVER_URL,
	emailAndPassword: {
		enabled: true,
	},
	database: drizzleAdapter(client, {
		provider: "pg",
		schema: {
			...schema,
			user: schema.user,
		},
	}),
	plugins: [
		organization(),
		tanstackStartCookies(),
		lastLoginMethod({
			storeInDatabase: true,
			schema: {
				user: {
					lastLoginMethod: "last_login_method",
				},
			},
		}),
	],
	socialProviders: {
		google: {
			clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
			redirectURI: `${env.SERVER_URL}/api/auth/callback/google`,
			mapProfileToUser(profile) {
				return {
					name: profile.name,
					email: profile.email,
					image: profile.picture,
				};
			},
		},
	},
	trustedOrigins: [env.SERVER_URL],
});

export type Session = typeof auth.$Infer.Session;
