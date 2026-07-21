import { NextResponse, type NextRequest } from "next/server";
import { portalSupabase } from "@/lib/supabase/portalClient";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ name: null });
  }

  const { data, error } = await portalSupabase.rpc("client_portal_get_client_name", { p_slug: slug });
  if (error) {
    return NextResponse.json({ name: null });
  }

  return NextResponse.json({ name: data ?? null });
}
