import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "@/db/schema";
import db from "@/db";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  TRUSTED_ORIGINS,
  COOKIE_DOMAIN,
  ENABLE_EMAIL_VERIFICATION,
  ENABLE_SIGNUP,
} from "@/constants";
import {
  sendPasswordSuccessfullyResetEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./email";

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: ENABLE_SIGNUP,
    requireEmailVerification: ENABLE_EMAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendResetPasswordEmail({ user, url });
      } catch (error) {
        console.error("[email] Error sending reset password email", error);
      }
    },
    onPasswordReset: async ({ user }) => {
      try {
        await sendPasswordSuccessfullyResetEmail({ user });
      } catch (error) {
        console.error(
          "[email] Error sending password successfully reset email",
          error,
        );
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendVerificationEmail({ user, url });
      } catch (error) {
        console.error("[email] Error sending verification email", error);
      }
    },
    sendOnSignUp: ENABLE_EMAIL_VERIFICATION,
    autoSignInAfterVerification: true,
  },

  trustedOrigins: TRUSTED_ORIGINS,
  appName: "Curiositi",
  advanced: {
    cookiePrefix: "curiositi",
    defaultCookieAttributes: {
      sameSite: "None",
      secure: true,
      partitioned: true,
      ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
    },
    useSecureCookies: true,
  },
});
