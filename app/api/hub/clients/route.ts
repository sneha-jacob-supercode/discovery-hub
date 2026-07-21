import { NextResponse } from "next/server";

const HUB_CLIENTS_URL = "https://hub.supercode.in/api/clients";

export async function GET() {
  const apiKey = process.env.HUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const res = await fetch(HUB_CLIENTS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    const data = await res.json();
    const rawClients = Array.isArray(data?.clients) ? data.clients : [];
    const clients = rawClients.map((c: Record<string, unknown>) => ({
      id: c.id,
      name: c.name,
      slack_channel_id: c.slack_channel_id ?? null,
      slack_channel_name: c.slack_channel_name,
      slug: c.slug,
      favicon_url: c.favicon_url ?? null,
    }));
    return NextResponse.json({ ok: true, clients });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
