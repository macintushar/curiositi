import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "@/db/schema";
import db from "@/db";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  TRUSTED_ORIGINS,
} from "@/constants";

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
    requireEmailVerification: false,
  },
  trustedOrigins: TRUSTED_ORIGINS,
  appName: "Curiositi",
  advanced: {
    cookiePrefix: "curiositi",
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
    useSecureCookies: true,
  },
});
