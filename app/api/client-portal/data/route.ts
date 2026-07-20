import { NextResponse, type NextRequest } from "next/server";
import { portalSupabase } from "@/lib/supabase/portalClient";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  const token = request.cookies.get(`cp_session_${slug}`)?.value;
  if (!token) {
    return NextResponse.json({ error: "not_verified" }, { status: 401 });
  }

  const { data, error } = await portalSupabase.rpc("client_portal_get_data", { p_token: token });

  if (error || !data) {
    const response = NextResponse.json({ error: "not_verified" }, { status: 401 });
    response.cookies.delete(`cp_session_${slug}`);
    return response;
  }

  return NextResponse.json(data);
}
