import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/internalAuth";

const PUBLIC_PREFIXES = ["/client", "/api"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);
  const authed = !!session;

  if (pathname === "/login") {
    if (authed) {
      const next = request.nextUrl.searchParams.get("next") || "/";
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
