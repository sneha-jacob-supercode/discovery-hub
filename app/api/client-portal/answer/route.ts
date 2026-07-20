import { NextResponse, type NextRequest } from "next/server";
import { portalSupabase } from "@/lib/supabase/portalClient";

type Action = "save_answer" | "add_entry" | "remove_entry" | "skip_question";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const action = body?.action as Action | undefined;
  const questionId = typeof body?.question_id === "string" ? body.question_id : "";

  if (!slug || !action || !questionId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const token = request.cookies.get(`cp_session_${slug}`)?.value;
  if (!token) {
    return NextResponse.json({ error: "not_verified" }, { status: 401 });
  }

  let result;
  switch (action) {
    case "save_answer":
      result = await portalSupabase.rpc("client_portal_save_answer", {
        p_token: token,
        p_question_id: questionId,
        p_value: body.value ?? null,
      });
      break;
    case "add_entry":
      result = await portalSupabase.rpc("client_portal_add_entry", {
        p_token: token,
        p_question_id: questionId,
        p_value: body.value ?? null,
      });
      break;
    case "remove_entry":
      result = await portalSupabase.rpc("client_portal_remove_entry", {
        p_token: token,
        p_question_id: questionId,
        p_index: body.entry_index ?? -1,
      });
      break;
    case "skip_question":
      result = await portalSupabase.rpc("client_portal_skip_question", {
        p_token: token,
        p_question_id: questionId,
      });
      break;
    default:
      return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  if (result.error || !result.data) {
    const response = NextResponse.json({ error: "not_verified" }, { status: 401 });
    response.cookies.delete(`cp_session_${slug}`);
    return response;
  }

  return NextResponse.json({ answer: result.data });
}
