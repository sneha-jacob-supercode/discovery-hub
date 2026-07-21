import { NextResponse, type NextRequest } from "next/server";
import { portalSupabase } from "@/lib/supabase/portalClient";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ name: null, faviconUrl: null });
  }

  const { data, error } = await portalSupabase.rpc("client_portal_get_client_name", { p_slug: slug });
  const row = data?.[0];
  if (error || !row) {
    return NextResponse.json({ name: null, faviconUrl: null });
  }

  return NextResponse.json({ name: row.name ?? null, faviconUrl: row.hub_favicon_url ?? null });
}
