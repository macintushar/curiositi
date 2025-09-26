import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { COOKIE_DOMAIN } from "./constants/auth";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "curiositi",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });

  const cookie = request.cookies;

  if (!sessionCookie && !cookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
