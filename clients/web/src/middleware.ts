import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    console.log("middleware - no session");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  console.log("middleware - with session");
  console.log(sessionCookie);

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
