import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { env } from "./env";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "__Secure-curiositi",
  });

  const cookie = request.cookies;

  if (!sessionCookie && !cookie) {
    console.log(env.NODE_ENV);
    console.log("No session cookie found");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
