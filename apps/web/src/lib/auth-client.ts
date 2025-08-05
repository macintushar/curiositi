"use client";

import { env } from "@/env";
import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";
import { COOKIE_DOMAIN } from "@/constants/auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [nextCookies()],
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "curiositi",
    defaultCookieAttributes: {
      sameSite: "None",
      secure: true,
      ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
    },
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
