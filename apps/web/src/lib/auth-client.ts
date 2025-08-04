"use client";

import { env } from "@/env";
import { createAuthClient } from "better-auth/react";
import { nextCookies } from "better-auth/next-js";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins: [nextCookies()],
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "curiositi",
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
