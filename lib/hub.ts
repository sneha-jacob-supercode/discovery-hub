const HUB_BASE_URL = "https://hub.supercode.in";

export async function hubFetch(path: string, body: Record<string, unknown>) {
  const apiKey = process.env.HUB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing HUB_API_KEY — check .env.local");
  }

  const res = await fetch(`${HUB_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}
