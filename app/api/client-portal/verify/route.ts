import { NextResponse, type NextRequest } from "next/server";
import { portalSupabase } from "@/lib/supabase/portalClient";

const COOKIE_MAX_AGE_SECONDS = 6 * 60 * 60; // matches the RPC's token TTL

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!slug || !email || !password) {
    return NextResponse.json({ ok: false });
  }

  const { data: token, error } = await portalSupabase.rpc("client_portal_verify_credentials", {
    p_slug: slug,
    p_email: email,
    p_password: password,
  });

  if (error || !token) {
    return NextResponse.json({ ok: false });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`cp_session_${slug}`, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
