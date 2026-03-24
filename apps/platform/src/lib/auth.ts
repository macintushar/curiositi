import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { lastLoginMethod } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { env } from "@platform/env";
import client from "@curiositi/db/client";
import * as schema from "@curiositi/db/schema";
import { sendPasswordResetEmail, sendInvitationEmail } from "@curiositi/email";

import { dash } from "@better-auth/infra";

export const auth = betterAuth({
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
			updateUserInfoOnLink: true,
		},
	},
	baseURL: env.PLATFORM_URL,
	trustedOrigins: [env.PLATFORM_URL],
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			if (!env.RESEND_API_KEY || !env.EMAIL_FROM_ADDRESS) {
				throw new Error("Password reset is disabled - email not configured");
			}
			await sendPasswordResetEmail({
				to: user.email,
				resetUrl: url,
				apiKey: env.RESEND_API_KEY,
				fromAddress: env.EMAIL_FROM_ADDRESS,
			});
		},
	},
	database: drizzleAdapter(client, {
		provider: "pg",
		schema: {
			...schema,
			user: schema.user,
		},
	}),
	plugins: [
		organization({
			sendInvitationEmail: async (data) => {
				if (!env.RESEND_API_KEY || !env.EMAIL_FROM_ADDRESS) {
					return;
				}
				await sendInvitationEmail({
					to: data.email,
					workspaceName: data.organization.name,
					inviteUrl: `${env.PLATFORM_URL}/invite?token=${data.invitation.id}`,
					inviterName: data.inviter.user.name,
					apiKey: env.RESEND_API_KEY,
					fromAddress: env.EMAIL_FROM_ADDRESS,
				});
			},
		}),
		tanstackStartCookies(),
		lastLoginMethod({
			storeInDatabase: true,
			schema: {
				user: {
					fields: {
						lastLoginMethod: "last_login_method",
					},
				},
			},
		}),
		dash(),
	],
	socialProviders: {
		google: {
			clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
			redirectURI: `${env.PLATFORM_URL}/api/auth/callback/google`,
			mapProfileToUser(profile) {
				return {
					name: profile.name,
					email: profile.email,
					image: profile.picture,
				};
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
