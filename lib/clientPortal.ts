"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnswerStatus, AnswerValue, Client, Question, Questionnaire } from "./types";
import type { GuidedEntryActions } from "@/components/GuidedEntry/GuidedEntryView";

type PortalAction = "save_answer" | "add_entry" | "remove_entry" | "skip_question";

function normalizeQuestion(q: Question): Question {
  return {
    ...q,
    options: q.options ?? undefined,
    placeholder: q.placeholder ?? undefined,
  };
}

function normalizeClient(client: Client): Client {
  return {
    ...client,
    channel_name: client.channel_name ?? undefined,
    meeting_date: client.meeting_date ?? undefined,
    // The client-portal RPC deliberately omits contact_emails from its
    // response (no reason to ship a client's sibling contacts to their own
    // browser) — default it so the shape still matches lib/types.ts.
    contact_emails: client.contact_emails ?? [],
    custom_questions: client.custom_questions.map(normalizeQuestion),
  };
}

function normalizeQuestionnaire(questionnaire: Questionnaire): Questionnaire {
  return {
    ...questionnaire,
    description: questionnaire.description ?? undefined,
    questions: questionnaire.questions.map(normalizeQuestion),
  };
}

export async function verifyCredentials(slug: string, email: string, password: string): Promise<boolean> {
  const res = await fetch("/api/client-portal/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, email, password }),
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => null);
  return !!data?.ok;
}

export async function fetchPortalData(
  slug: string
): Promise<{ client: Client; questionnaire: Questionnaire } | null> {
  const res = await fetch(`/api/client-portal/data?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.client || !data?.questionnaire) return null;
  return { client: normalizeClient(data.client), questionnaire: normalizeQuestionnaire(data.questionnaire) };
}

export async function fetchClientName(slug: string): Promise<string | null> {
  const res = await fetch(`/api/client-portal/name?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.name ?? null;
}

async function applyAnswerAction(
  slug: string,
  action: PortalAction,
  questionId: string,
  extra: { value?: AnswerValue; entry_index?: number }
): Promise<void> {
  const res = await fetch("/api/client-portal/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, action, question_id: questionId, ...extra }),
  });
  if (!res.ok) throw new Error(`client-portal ${action} failed`);
}

export function usePortalClientData(slug: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "needs_verification" | "ready">("checking");

  const load = useCallback(async () => {
    const data = await fetchPortalData(slug);
    if (data) {
      setClient(data.client);
      setQuestionnaire(data.questionnaire);
      setStatus("ready");
    } else {
      setStatus("needs_verification");
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchClientName(slug).then(setClientName);
  }, [slug]);

  const verify = useCallback(
    async (email: string, password: string) => {
      const ok = await verifyCredentials(slug, email, password);
      if (ok) await load();
      return ok;
    },
    [slug, load]
  );

  const saveAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      setClient((prev) =>
        prev ? { ...prev, answers: { ...prev.answers, [questionId]: { status: "answered", value } } } : prev
      );
      applyAnswerAction(slug, "save_answer", questionId, { value }).catch((err) =>
        console.error("Failed to save answer", err)
      );
    },
    [slug]
  );

  const addEntry = useCallback(
    (questionId: string, value: AnswerValue) => {
      const entries = [...(client?.answers[questionId]?.entries ?? []), value];
      setClient((prev) =>
        prev ? { ...prev, answers: { ...prev.answers, [questionId]: { status: "answered", entries } } } : prev
      );
      applyAnswerAction(slug, "add_entry", questionId, { value }).catch((err) =>
        console.error("Failed to add entry", err)
      );
    },
    [slug, client]
  );

  const removeEntry = useCallback(
    (questionId: string, index: number) => {
      const existingEntries = client?.answers[questionId]?.entries;
      if (!existingEntries) return;
      const entries = existingEntries.filter((_, i) => i !== index);
      const status: AnswerStatus = entries.length > 0 ? "answered" : "skipped";
      setClient((prev) =>
        prev ? { ...prev, answers: { ...prev.answers, [questionId]: { status, entries } } } : prev
      );
      applyAnswerAction(slug, "remove_entry", questionId, { entry_index: index }).catch((err) =>
        console.error("Failed to remove entry", err)
      );
    },
    [slug, client]
  );

  const skipQuestion = useCallback(
    (questionId: string) => {
      setClient((prev) =>
        prev ? { ...prev, answers: { ...prev.answers, [questionId]: { status: "skipped" } } } : prev
      );
      applyAnswerAction(slug, "skip_question", questionId, {}).catch((err) =>
        console.error("Failed to skip question", err)
      );
    },
    [slug]
  );

  const actions: GuidedEntryActions = useMemo(
    () => ({ saveAnswer, addEntry, removeEntry, skipQuestion }),
    [saveAnswer, addEntry, removeEntry, skipQuestion]
  );

  return { client, questionnaire, clientName, status, verify, actions };
}
