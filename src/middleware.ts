import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

/**
 * Redirects unauthenticated visitors away from /admin.
 *
 * This is UX, not security: it keeps the admin chrome from flashing and sends
 * people to the login form. Authorization itself lives in requireAdmin(),
 * which every server action calls — middleware never runs for an action POST
 * dispatched from a public route.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (await isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
