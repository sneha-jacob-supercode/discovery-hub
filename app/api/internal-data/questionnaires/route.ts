import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/internalAuth";

async function requireSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const [
    { data: qRows, error: qError },
    { data: questionRows, error: questionError },
  ] = await Promise.all([
    supabaseAdmin.from("questionnaires").select("*").order("created_at"),
    supabaseAdmin.from("questions").select("*").not("questionnaire_id", "is", null).order("order_index"),
  ]);

  if (qError || questionError) {
    return NextResponse.json({ error: "load_failed" }, { status: 500 });
  }

  return NextResponse.json({ qRows: qRows ?? [], questionRows: questionRows ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action as string | undefined;

  switch (action) {
    case "create_questionnaire": {
      const { error } = await supabaseAdmin.from("questionnaires").insert(body.questionnaire);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "update_questionnaire": {
      const { questionnaireId, patch } = body;
      const { error } = await supabaseAdmin.from("questionnaires").update(patch).eq("id", questionnaireId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "delete_questionnaire": {
      const { error } = await supabaseAdmin.from("questionnaires").delete().eq("id", body.questionnaireId);
      if (error) {
        if (error.code === "23503") {
          return NextResponse.json({ error: "questionnaire_in_use" }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    case "add_question": {
      const { error } = await supabaseAdmin.from("questions").insert(body.question);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "update_question": {
      const { questionId, patch } = body;
      const { error } = await supabaseAdmin.from("questions").update(patch).eq("id", questionId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "remove_question": {
      const { error } = await supabaseAdmin.from("questions").delete().eq("id", body.questionId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "persist_order": {
      const items = body.items as { id: string; order_index: number }[];
      const results = await Promise.all(
        items.map((item) =>
          supabaseAdmin.from("questions").update({ order_index: item.order_index }).eq("id", item.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
}
