"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Answer, AnswerStatus, AnswerValue, Client, FieldType, Question } from "./types";
import { supabase } from "./supabaseClient";

function nowIso() {
  return new Date().toISOString();
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "client"}-${Math.random().toString(36).slice(2, 7)}`;
}

function newCustomQuestionId(label: string) {
  return `custom_${slugify(label).replace(/-[a-z0-9]{5}$/, "")}_${Date.now()
    .toString(36)
    .slice(-4)}_${Math.random().toString(36).slice(2, 4)}`;
}

interface ClientRow {
  id: string;
  slug: string;
  name: string;
  channel_name: string | null;
  meeting_date: string | null;
  contact_emails: string[];
  questionnaire_id: string;
  created_at: string;
  last_updated: string;
  hub_client_id: string | null;
  hub_slack_channel_id: string | null;
  hub_favicon_url: string | null;
}

interface QuestionRow {
  id: string;
  questionnaire_id: string | null;
  client_id: string | null;
  section: string;
  label: string;
  field_type: FieldType;
  is_repeatable: boolean;
  options: string[] | null;
  placeholder: string | null;
  is_custom: boolean;
  order_index: number;
}

interface AnswerRow {
  client_id: string;
  question_id: string;
  status: AnswerStatus;
  value: AnswerValue | null;
  entries: AnswerValue[] | null;
}

interface HiddenRow {
  client_id: string;
  question_id: string;
}

interface OverrideRow {
  client_id: string;
  question_id: string;
  label: string;
  section: string;
  field_type: FieldType;
  is_repeatable: boolean;
  options: string[] | null;
}

function rowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    section: row.section,
    label: row.label,
    field_type: row.field_type,
    is_repeatable: row.is_repeatable,
    options: row.options ?? undefined,
    placeholder: row.placeholder ?? undefined,
    is_custom: row.is_custom,
  };
}

export type QuestionPatch = Pick<Question, "label" | "section" | "field_type" | "is_repeatable" | "options">;

interface ClientStoreValue {
  clients: Client[];
  isHydrated: boolean;
  getClient: (id: string) => Client | undefined;
  createClient: (
    questionnaireId: string,
    name?: string,
    contactEmails?: string[],
    hub?: { hubClientId: string; hubSlackChannelId: string | null; hubFaviconUrl: string | null }
  ) => Promise<Client>;
  deleteClient: (clientId: string) => Promise<void>;
  duplicateClient: (clientId: string) => Promise<Client | undefined>;
  saveAnswer: (clientId: string, questionId: string, value: AnswerValue) => Promise<void>;
  addEntry: (clientId: string, questionId: string, value: AnswerValue) => Promise<void>;
  removeEntry: (clientId: string, questionId: string, index: number) => Promise<void>;
  skipQuestion: (clientId: string, questionId: string) => Promise<void>;
  addCustomQuestion: (
    clientId: string,
    question: Omit<Question, "id" | "is_custom">
  ) => Promise<Question>;
  hideQuestion: (clientId: string, questionId: string) => Promise<void>;
  unhideQuestion: (clientId: string, questionId: string) => Promise<void>;
  updateCustomQuestion: (clientId: string, questionId: string, patch: QuestionPatch) => Promise<void>;
  updateQuestionOverride: (clientId: string, questionId: string, patch: QuestionPatch) => Promise<void>;
  updateContactEmails: (clientId: string, contactEmails: string[]) => Promise<void>;
  setClientPassword: (clientId: string, password: string) => Promise<void>;
}

const ClientStoreContext = createContext<ClientStoreValue | null>(null);

function updateClient(clients: Client[], clientId: string, patch: (c: Client) => Client): Client[] {
  return clients.map((c) => (c.id === clientId ? patch(c) : c));
}

async function upsertAnswer(
  clientId: string,
  questionId: string,
  status: AnswerStatus,
  value: AnswerValue | null,
  entries: AnswerValue[] | null
) {
  const { error } = await supabase
    .from("answers")
    .upsert({ client_id: clientId, question_id: questionId, status, value, entries, updated_at: nowIso() });
  if (error) throw error;
}

export function ClientStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [
          { data: clientRows, error: clientError },
          { data: customQuestionRows, error: questionError },
          { data: answerRows, error: answerError },
          { data: hiddenRows, error: hiddenError },
          { data: overrideRows, error: overrideError },
        ] = await Promise.all([
          supabase
            .from("clients")
            .select(
              "id, slug, name, channel_name, meeting_date, contact_emails, questionnaire_id, created_at, last_updated, hub_client_id, hub_slack_channel_id, hub_favicon_url"
            )
            .order("created_at", { ascending: false }),
          supabase.from("questions").select("*").not("client_id", "is", null).order("order_index"),
          supabase.from("answers").select("*"),
          supabase.from("client_hidden_questions").select("*"),
          supabase.from("client_question_overrides").select("*"),
        ]);
        if (clientError) throw clientError;
        if (questionError) throw questionError;
        if (answerError) throw answerError;
        if (hiddenError) throw hiddenError;
        if (overrideError) throw overrideError;

        const assembled: Client[] = ((clientRows ?? []) as ClientRow[]).map((row) => {
          const clientAnswers: Record<string, Answer> = {};
          for (const a of (answerRows ?? []) as AnswerRow[]) {
            if (a.client_id !== row.id) continue;
            clientAnswers[a.question_id] = {
              status: a.status,
              value: a.value ?? undefined,
              entries: a.entries ?? undefined,
            };
          }
          return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            channel_name: row.channel_name ?? undefined,
            meeting_date: row.meeting_date ?? undefined,
            contact_emails: row.contact_emails ?? [],
            created_at: row.created_at,
            last_updated: row.last_updated,
            answers: clientAnswers,
            custom_questions: ((customQuestionRows ?? []) as QuestionRow[])
              .filter((q) => q.client_id === row.id)
              .map(rowToQuestion),
            hidden_question_ids: ((hiddenRows ?? []) as HiddenRow[])
              .filter((h) => h.client_id === row.id)
              .map((h) => h.question_id),
            question_overrides: Object.fromEntries(
              ((overrideRows ?? []) as OverrideRow[])
                .filter((o) => o.client_id === row.id)
                .map((o) => [
                  o.question_id,
                  {
                    label: o.label,
                    section: o.section,
                    field_type: o.field_type,
                    is_repeatable: o.is_repeatable,
                    options: o.options ?? undefined,
                  },
                ])
            ),
            questionnaire_id: row.questionnaire_id,
            hub_client_id: row.hub_client_id,
            hub_slack_channel_id: row.hub_slack_channel_id,
            hub_favicon_url: row.hub_favicon_url,
          };
        });

        if (!cancelled) setClients(assembled);
      } catch (err) {
        console.error("Failed to load clients from Supabase", err);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);

  const createClient = useCallback(
    async (
      questionnaireId: string,
      name?: string,
      contactEmails?: string[],
      hub?: { hubClientId: string; hubSlackChannelId: string | null; hubFaviconUrl: string | null }
    ) => {
      const label = name?.trim() || "New Client";
      const emails = contactEmails ?? [];
      const client: Client = {
        id: slugify(label),
        slug: slugify(label),
        name: label,
        contact_emails: emails,
        created_at: nowIso(),
        last_updated: nowIso(),
        answers: {},
        custom_questions: [],
        hidden_question_ids: [],
        question_overrides: {},
        questionnaire_id: questionnaireId,
        hub_client_id: hub?.hubClientId ?? null,
        hub_slack_channel_id: hub?.hubSlackChannelId ?? null,
        hub_favicon_url: hub?.hubFaviconUrl ?? null,
      };
      setClients((prev) => [client, ...prev]);
      try {
        const { error } = await supabase.from("clients").insert({
          id: client.id,
          slug: client.slug,
          name: client.name,
          channel_name: null,
          meeting_date: null,
          contact_emails: emails,
          questionnaire_id: client.questionnaire_id,
          created_at: client.created_at,
          last_updated: client.last_updated,
          hub_client_id: client.hub_client_id,
          hub_slack_channel_id: client.hub_slack_channel_id,
          hub_favicon_url: client.hub_favicon_url,
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to create client", err);
        setClients((prev) => prev.filter((c) => c.id !== client.id));
      }
      return client;
    },
    []
  );

  const deleteClient = useCallback(async (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to delete client", err);
    }
  }, []);

  const duplicateClient = useCallback(
    async (clientId: string) => {
      const original = clients.find((c) => c.id === clientId);
      if (!original) return undefined;

      // Custom questions carry ids that already exist in the DB (owned by the
      // original client) — regenerate them so the duplicate's rows don't
      // collide, remapping answers/hidden-ids to match.
      const idMap = new Map<string, string>();
      const remappedCustomQuestions = original.custom_questions.map((q) => {
        const newId = newCustomQuestionId(q.label);
        idMap.set(q.id, newId);
        return { ...q, id: newId };
      });
      const remappedAnswers: Record<string, Answer> = {};
      for (const [questionId, answer] of Object.entries(original.answers)) {
        remappedAnswers[idMap.get(questionId) ?? questionId] = structuredClone(answer);
      }
      const remappedHiddenIds = original.hidden_question_ids.map((id) => idMap.get(id) ?? id);

      const name = `${original.name} (Copy)`;
      const duplicateId = slugify(name);
      const duplicate: Client = {
        ...structuredClone(original),
        id: duplicateId,
        slug: duplicateId,
        name,
        created_at: nowIso(),
        last_updated: nowIso(),
        custom_questions: remappedCustomQuestions,
        answers: remappedAnswers,
        hidden_question_ids: remappedHiddenIds,
      };
      setClients((prev) => [duplicate, ...prev]);

      try {
        const { error: clientError } = await supabase.from("clients").insert({
          id: duplicate.id,
          slug: duplicate.slug,
          name: duplicate.name,
          channel_name: duplicate.channel_name ?? null,
          meeting_date: duplicate.meeting_date ?? null,
          contact_emails: duplicate.contact_emails,
          questionnaire_id: duplicate.questionnaire_id,
          created_at: duplicate.created_at,
          last_updated: duplicate.last_updated,
          hub_client_id: duplicate.hub_client_id,
          hub_slack_channel_id: duplicate.hub_slack_channel_id,
          hub_favicon_url: duplicate.hub_favicon_url,
        });
        if (clientError) throw clientError;

        if (remappedCustomQuestions.length > 0) {
          const { error: questionsError } = await supabase.from("questions").insert(
            remappedCustomQuestions.map((q, i) => ({
              id: q.id,
              questionnaire_id: null,
              client_id: duplicate.id,
              section: q.section,
              label: q.label,
              field_type: q.field_type,
              is_repeatable: q.is_repeatable,
              options: q.options ?? null,
              placeholder: q.placeholder ?? null,
              is_custom: true,
              order_index: (i + 1) * 10,
            }))
          );
          if (questionsError) throw questionsError;
        }

        const answerEntries = Object.entries(duplicate.answers);
        if (answerEntries.length > 0) {
          const { error: answersError } = await supabase.from("answers").insert(
            answerEntries.map(([questionId, answer]) => ({
              client_id: duplicate.id,
              question_id: questionId,
              status: answer.status,
              value: answer.value ?? null,
              entries: answer.entries ?? null,
              updated_at: nowIso(),
            }))
          );
          if (answersError) throw answersError;
        }

        if (duplicate.hidden_question_ids.length > 0) {
          const { error: hiddenError } = await supabase.from("client_hidden_questions").insert(
            duplicate.hidden_question_ids.map((questionId) => ({
              client_id: duplicate.id,
              question_id: questionId,
            }))
          );
          if (hiddenError) throw hiddenError;
        }

        const overrideEntries = Object.entries(duplicate.question_overrides);
        if (overrideEntries.length > 0) {
          const { error: overrideError } = await supabase.from("client_question_overrides").insert(
            overrideEntries.map(([questionId, patch]) => ({
              client_id: duplicate.id,
              question_id: questionId,
              label: patch.label,
              section: patch.section,
              field_type: patch.field_type,
              is_repeatable: patch.is_repeatable,
              options: patch.options ?? null,
            }))
          );
          if (overrideError) throw overrideError;
        }
      } catch (err) {
        console.error("Failed to duplicate client", err);
        setClients((prev) => prev.filter((c) => c.id !== duplicate.id));
        return undefined;
      }
      return duplicate;
    },
    [clients]
  );

  const saveAnswer = useCallback(async (clientId: string, questionId: string, value: AnswerValue) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => ({
        ...c,
        last_updated: nowIso(),
        answers: { ...c.answers, [questionId]: { status: "answered", value } },
      }))
    );
    try {
      await upsertAnswer(clientId, questionId, "answered", value, null);
    } catch (err) {
      console.error("Failed to save answer", err);
    }
  }, []);

  const addEntry = useCallback(
    async (clientId: string, questionId: string, value: AnswerValue) => {
      const client = clients.find((c) => c.id === clientId);
      const entries = [...(client?.answers[questionId]?.entries ?? []), value];
      setClients((prev) =>
        updateClient(prev, clientId, (c) => ({
          ...c,
          last_updated: nowIso(),
          answers: { ...c.answers, [questionId]: { status: "answered", entries } },
        }))
      );
      try {
        await upsertAnswer(clientId, questionId, "answered", null, entries);
      } catch (err) {
        console.error("Failed to add entry", err);
      }
    },
    [clients]
  );

  const removeEntry = useCallback(
    async (clientId: string, questionId: string, index: number) => {
      const client = clients.find((c) => c.id === clientId);
      const existingEntries = client?.answers[questionId]?.entries;
      if (!existingEntries) return;
      const entries = existingEntries.filter((_, i) => i !== index);
      const status: AnswerStatus = entries.length > 0 ? "answered" : "skipped";
      setClients((prev) =>
        updateClient(prev, clientId, (c) => ({
          ...c,
          last_updated: nowIso(),
          answers: { ...c.answers, [questionId]: { status, entries } },
        }))
      );
      try {
        await upsertAnswer(clientId, questionId, status, null, entries);
      } catch (err) {
        console.error("Failed to remove entry", err);
      }
    },
    [clients]
  );

  const skipQuestion = useCallback(async (clientId: string, questionId: string) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => ({
        ...c,
        last_updated: nowIso(),
        answers: { ...c.answers, [questionId]: { status: "skipped" } },
      }))
    );
    try {
      await upsertAnswer(clientId, questionId, "skipped", null, null);
    } catch (err) {
      console.error("Failed to skip question", err);
    }
  }, []);

  const addCustomQuestion = useCallback(
    async (clientId: string, question: Omit<Question, "id" | "is_custom">) => {
      const client = clients.find((c) => c.id === clientId);
      const newQuestion: Question = {
        ...question,
        id: newCustomQuestionId(question.label),
        is_custom: true,
      };
      const orderIndex = ((client?.custom_questions.length ?? 0) + 1) * 10;
      setClients((prev) =>
        updateClient(prev, clientId, (c) => ({
          ...c,
          last_updated: nowIso(),
          custom_questions: [...c.custom_questions, newQuestion],
        }))
      );
      try {
        const { error } = await supabase.from("questions").insert({
          id: newQuestion.id,
          questionnaire_id: null,
          client_id: clientId,
          section: newQuestion.section,
          label: newQuestion.label,
          field_type: newQuestion.field_type,
          is_repeatable: newQuestion.is_repeatable,
          options: newQuestion.options ?? null,
          placeholder: newQuestion.placeholder ?? null,
          is_custom: true,
          order_index: orderIndex,
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add custom question", err);
        setClients((prev) =>
          updateClient(prev, clientId, (c) => ({
            ...c,
            custom_questions: c.custom_questions.filter((q) => q.id !== newQuestion.id),
          }))
        );
      }
      return newQuestion;
    },
    [clients]
  );

  const hideQuestion = useCallback(async (clientId: string, questionId: string) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) =>
        c.hidden_question_ids.includes(questionId)
          ? c
          : {
              ...c,
              last_updated: nowIso(),
              hidden_question_ids: [...c.hidden_question_ids, questionId],
            }
      )
    );
    try {
      const { error } = await supabase
        .from("client_hidden_questions")
        .upsert({ client_id: clientId, question_id: questionId });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to hide question", err);
    }
  }, []);

  const unhideQuestion = useCallback(async (clientId: string, questionId: string) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => ({
        ...c,
        last_updated: nowIso(),
        hidden_question_ids: c.hidden_question_ids.filter((id) => id !== questionId),
      }))
    );
    try {
      const { error } = await supabase
        .from("client_hidden_questions")
        .delete()
        .eq("client_id", clientId)
        .eq("question_id", questionId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to unhide question", err);
    }
  }, []);

  const updateCustomQuestion = useCallback(
    async (clientId: string, questionId: string, patch: QuestionPatch) => {
      const client = clients.find((c) => c.id === clientId);
      const previous = client?.custom_questions.find((q) => q.id === questionId);
      setClients((prev) =>
        updateClient(prev, clientId, (c) => ({
          ...c,
          last_updated: nowIso(),
          custom_questions: c.custom_questions.map((q) =>
            q.id === questionId ? { ...q, ...patch } : q
          ),
        }))
      );
      try {
        const { error } = await supabase
          .from("questions")
          .update({
            label: patch.label,
            section: patch.section,
            field_type: patch.field_type,
            is_repeatable: patch.is_repeatable,
            options: patch.options ?? null,
          })
          .eq("id", questionId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update custom question", err);
        if (previous) {
          setClients((prev) =>
            updateClient(prev, clientId, (c) => ({
              ...c,
              custom_questions: c.custom_questions.map((q) => (q.id === questionId ? previous : q)),
            }))
          );
        }
      }
    },
    [clients]
  );

  const updateQuestionOverride = useCallback(
    async (clientId: string, questionId: string, patch: QuestionPatch) => {
      const client = clients.find((c) => c.id === clientId);
      const previous = client?.question_overrides[questionId];
      setClients((prev) =>
        updateClient(prev, clientId, (c) => ({
          ...c,
          last_updated: nowIso(),
          question_overrides: { ...c.question_overrides, [questionId]: patch },
        }))
      );
      try {
        const { error } = await supabase.from("client_question_overrides").upsert({
          client_id: clientId,
          question_id: questionId,
          label: patch.label,
          section: patch.section,
          field_type: patch.field_type,
          is_repeatable: patch.is_repeatable,
          options: patch.options ?? null,
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update question override", err);
        setClients((prev) =>
          updateClient(prev, clientId, (c) => {
            const next = { ...c.question_overrides };
            if (previous) next[questionId] = previous;
            else delete next[questionId];
            return { ...c, question_overrides: next };
          })
        );
      }
    },
    [clients]
  );

  const updateContactEmails = useCallback(async (clientId: string, contactEmails: string[]) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => ({
        ...c,
        last_updated: nowIso(),
        contact_emails: contactEmails,
      }))
    );
    try {
      const { error } = await supabase
        .from("clients")
        .update({ contact_emails: contactEmails, last_updated: nowIso() })
        .eq("id", clientId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update contact emails", err);
    }
  }, []);

  const setClientPassword = useCallback(async (clientId: string, password: string) => {
    try {
      const { error } = await supabase.rpc("set_client_password", {
        p_client_id: clientId,
        p_password: password,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to set client password", err);
      throw err;
    }
  }, []);

  const value = useMemo<ClientStoreValue>(
    () => ({
      clients,
      isHydrated,
      getClient,
      createClient,
      deleteClient,
      duplicateClient,
      saveAnswer,
      addEntry,
      removeEntry,
      skipQuestion,
      addCustomQuestion,
      hideQuestion,
      unhideQuestion,
      updateCustomQuestion,
      updateQuestionOverride,
      updateContactEmails,
      setClientPassword,
    }),
    [
      clients,
      isHydrated,
      getClient,
      createClient,
      deleteClient,
      duplicateClient,
      saveAnswer,
      addEntry,
      removeEntry,
      skipQuestion,
      addCustomQuestion,
      hideQuestion,
      unhideQuestion,
      updateCustomQuestion,
      updateQuestionOverride,
      updateContactEmails,
      setClientPassword,
    ]
  );

  return <ClientStoreContext.Provider value={value}>{children}</ClientStoreContext.Provider>;
}

export function useClientStore() {
  const ctx = useContext(ClientStoreContext);
  if (!ctx) throw new Error("useClientStore must be used within ClientStoreProvider");
  return ctx;
}
