import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = ["/client", "/api", "/auth"];

function isAllowedEmail(email: string | undefined | null) {
  return !!email && email.toLowerCase().endsWith("@supercode.in");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  const authed = isAllowedEmail(user?.email);

  if (pathname === "/login") {
    if (authed) {
      const next = request.nextUrl.searchParams.get("next") || "/";
      return NextResponse.redirect(new URL(next, request.url));
    }
    return response;
  }

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
