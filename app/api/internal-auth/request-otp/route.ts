import { NextResponse, type NextRequest } from "next/server";
import { hubFetch } from "@/lib/hub";

const THROTTLE_WINDOW_MS = 10 * 1000;
const lastRequestByIp = new Map<string, number>();

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const last = lastRequestByIp.get(ip);
  if (last && now - last < THROTTLE_WINDOW_MS) {
    return NextResponse.json({ error: "Please wait a moment before trying again" }, { status: 429 });
  }
  lastRequestByIp.set(ip, now);

  try {
    const { status, data } = await hubFetch("/api/auth/request-otp", { email });
    return NextResponse.json(data ?? { ok: false }, { status });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
