import { NextResponse, type NextRequest } from "next/server";
import { hubFetch } from "@/lib/hub";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/internalAuth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }

  let hubResult;
  try {
    hubResult = await hubFetch("/api/auth/verify-otp", { email, otp });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const { status, data } = hubResult;
  if (status !== 200 || !data?.ok || !data.user) {
    return NextResponse.json(
      { ok: false, error: data?.error ?? "Invalid or expired code" },
      { status: status === 200 ? 401 : status }
    );
  }

  let token;
  try {
    token = await signSession({
      email: data.user.email,
      member_id: data.user.member_id ?? null,
      name: data.user.name,
      designation: data.user.designation,
    });
  } catch {
    return NextResponse.json(
      { error: "Server misconfigured (missing INTERNAL_SESSION_SECRET)" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
