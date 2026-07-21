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
    { data: clientRows, error: clientError },
    { data: customQuestionRows, error: questionError },
    { data: answerRows, error: answerError },
    { data: hiddenRows, error: hiddenError },
    { data: overrideRows, error: overrideError },
  ] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select(
        "id, slug, name, channel_name, meeting_date, contact_emails, questionnaire_id, created_at, last_updated, hub_client_id, hub_slack_channel_id, hub_favicon_url"
      )
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("questions").select("*").not("client_id", "is", null).order("order_index"),
    supabaseAdmin.from("answers").select("*"),
    supabaseAdmin.from("client_hidden_questions").select("*"),
    supabaseAdmin.from("client_question_overrides").select("*"),
  ]);

  if (clientError || questionError || answerError || hiddenError || overrideError) {
    return NextResponse.json({ error: "load_failed" }, { status: 500 });
  }

  return NextResponse.json({
    clientRows: clientRows ?? [],
    customQuestionRows: customQuestionRows ?? [],
    answerRows: answerRows ?? [],
    hiddenRows: hiddenRows ?? [],
    overrideRows: overrideRows ?? [],
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action as string | undefined;

  switch (action) {
    case "create_client": {
      const { error } = await supabaseAdmin.from("clients").insert(body.client);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "delete_client": {
      const { error } = await supabaseAdmin.from("clients").delete().eq("id", body.clientId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "duplicate_client": {
      const { client, customQuestions, answers, hiddenQuestionIds, overrides } = body;

      const { error: clientError } = await supabaseAdmin.from("clients").insert(client);
      if (clientError) return NextResponse.json({ error: clientError.message }, { status: 400 });

      if (customQuestions?.length > 0) {
        const { error } = await supabaseAdmin.from("questions").insert(customQuestions);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (answers?.length > 0) {
        const { error } = await supabaseAdmin.from("answers").insert(answers);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (hiddenQuestionIds?.length > 0) {
        const { error } = await supabaseAdmin.from("client_hidden_questions").insert(hiddenQuestionIds);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (overrides?.length > 0) {
        const { error } = await supabaseAdmin.from("client_question_overrides").insert(overrides);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    case "upsert_answer": {
      const { clientId, questionId, status, value, entries } = body;
      const { error } = await supabaseAdmin.from("answers").upsert({
        client_id: clientId,
        question_id: questionId,
        status,
        value: value ?? null,
        entries: entries ?? null,
        updated_at: new Date().toISOString(),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "add_custom_question": {
      const { error } = await supabaseAdmin.from("questions").insert(body.question);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "hide_question": {
      const { clientId, questionId } = body;
      const { error } = await supabaseAdmin
        .from("client_hidden_questions")
        .upsert({ client_id: clientId, question_id: questionId });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "unhide_question": {
      const { clientId, questionId } = body;
      const { error } = await supabaseAdmin
        .from("client_hidden_questions")
        .delete()
        .eq("client_id", clientId)
        .eq("question_id", questionId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "update_custom_question": {
      const { questionId, patch } = body;
      const { error } = await supabaseAdmin
        .from("questions")
        .update({
          label: patch.label,
          section: patch.section,
          field_type: patch.field_type,
          is_repeatable: patch.is_repeatable,
          options: patch.options ?? null,
        })
        .eq("id", questionId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "update_question_override": {
      const { clientId, questionId, patch } = body;
      const { error } = await supabaseAdmin.from("client_question_overrides").upsert({
        client_id: clientId,
        question_id: questionId,
        label: patch.label,
        section: patch.section,
        field_type: patch.field_type,
        is_repeatable: patch.is_repeatable,
        options: patch.options ?? null,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "update_contact_emails": {
      const { clientId, contactEmails } = body;
      const { error } = await supabaseAdmin
        .from("clients")
        .update({ contact_emails: contactEmails, last_updated: new Date().toISOString() })
        .eq("id", clientId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "set_client_password": {
      const { clientId, password } = body;
      const { error } = await supabaseAdmin.rpc("set_client_password", {
        p_client_id: clientId,
        p_password: password,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    case "get_client_password": {
      const { clientId } = body;
      const { data, error } = await supabaseAdmin.rpc("get_client_password", {
        p_client_id: clientId,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ password: data ?? null });
    }

    default:
      return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
}
