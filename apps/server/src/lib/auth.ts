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
    enabled: true,
    requireEmailVerification: ENABLE_EMAIL_VERIFICATION,
    sendResetPassword: async ({ user, url, token }) => {
      await sendResetPasswordEmail({ user, url, token }).catch((error) => {
        console.error(error);
      });
    },
    onPasswordReset: async ({ user }) => {
      await sendPasswordSuccessfullyResetEmail({ user }).catch((error) => {
        console.error(error);
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail({ user, url, token }).catch((error) => {
        console.error(error);
      });
    },
    sendOnSignUp: true,
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
