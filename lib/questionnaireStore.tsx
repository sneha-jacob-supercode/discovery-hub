"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FieldType, Question, Questionnaire } from "./types";
import { reorderWithinSection, reorderSections } from "./questions";

async function postQuestionnaireAction(action: string, payload: Record<string, unknown>) {
  const res = await fetch("/api/internal-data/questionnaires", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "request_failed");
  return data;
}

function nowIso() {
  return new Date().toISOString();
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "questionnaire"}-${Math.random().toString(36).slice(2, 7)}`;
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

interface QuestionnaireRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  last_updated: string;
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

function questionToInsertRow(
  question: Question,
  owner: { questionnaire_id: string | null; client_id: string | null },
  orderIndex: number
) {
  return {
    id: question.id,
    questionnaire_id: owner.questionnaire_id,
    client_id: owner.client_id,
    section: question.section,
    label: question.label,
    field_type: question.field_type,
    is_repeatable: question.is_repeatable,
    options: question.options ?? null,
    placeholder: question.placeholder ?? null,
    is_custom: question.is_custom ?? owner.client_id !== null,
    order_index: orderIndex,
  };
}

interface QuestionnaireStoreValue {
  questionnaires: Questionnaire[];
  isHydrated: boolean;
  getQuestionnaire: (id: string) => Questionnaire | undefined;
  createQuestionnaire: (name: string) => Promise<Questionnaire>;
  updateQuestionnaire: (questionnaireId: string, name: string) => Promise<void>;
  deleteQuestionnaire: (questionnaireId: string) => Promise<void>;
  addQuestion: (questionnaireId: string, question: Omit<Question, "id">) => Promise<Question>;
  updateQuestion: (
    questionnaireId: string,
    questionId: string,
    patch: Partial<Omit<Question, "id">>
  ) => Promise<void>;
  removeQuestion: (questionnaireId: string, questionId: string) => Promise<void>;
  moveQuestion: (questionnaireId: string, questionId: string, direction: "up" | "down") => Promise<void>;
  moveSection: (questionnaireId: string, section: string, direction: "up" | "down") => Promise<void>;
}

const QuestionnaireStoreContext = createContext<QuestionnaireStoreValue | null>(null);

function updateQuestionnaireList(
  list: Questionnaire[],
  id: string,
  patch: (q: Questionnaire) => Questionnaire
): Questionnaire[] {
  return list.map((q) => (q.id === id ? patch(q) : q));
}

async function persistOrder(questions: Question[]) {
  await postQuestionnaireAction("persist_order", {
    items: questions.map((q, i) => ({ id: q.id, order_index: (i + 1) * 10 })),
  });
}

export function QuestionnaireStoreProvider({ children }: { children: React.ReactNode }) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/internal-data/questionnaires");
        if (!res.ok) throw new Error("failed to load questionnaires");
        const { qRows, questionRows } = await res.json();

        const assembled: Questionnaire[] = ((qRows ?? []) as QuestionnaireRow[]).map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description ?? undefined,
          created_at: row.created_at,
          last_updated: row.last_updated,
          questions: ((questionRows ?? []) as QuestionRow[])
            .filter((q) => q.questionnaire_id === row.id)
            .map(rowToQuestion),
        }));

        if (!cancelled) setQuestionnaires(assembled);
      } catch (err) {
        console.error("Failed to load questionnaires from Supabase", err);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getQuestionnaire = useCallback(
    (id: string) => questionnaires.find((q) => q.id === id),
    [questionnaires]
  );

  const createQuestionnaire = useCallback(async (name: string) => {
    const label = name.trim() || "New Questionnaire";
    const questionnaire: Questionnaire = {
      id: slugify(label),
      name: label,
      questions: [],
      created_at: nowIso(),
      last_updated: nowIso(),
    };
    setQuestionnaires((prev) => [questionnaire, ...prev]);
    try {
      await postQuestionnaireAction("create_questionnaire", {
        questionnaire: {
          id: questionnaire.id,
          name: questionnaire.name,
          description: questionnaire.description ?? null,
          created_at: questionnaire.created_at,
          last_updated: questionnaire.last_updated,
        },
      });
    } catch (err) {
      console.error("Failed to create questionnaire", err);
      setQuestionnaires((prev) => prev.filter((q) => q.id !== questionnaire.id));
    }
    return questionnaire;
  }, []);

  const updateQuestionnaire = useCallback(
    async (questionnaireId: string, name: string) => {
      const label = name.trim();
      if (!label) return;
      const previous = questionnaires.find((q) => q.id === questionnaireId);
      const updatedAt = nowIso();
      setQuestionnaires((prev) =>
        updateQuestionnaireList(prev, questionnaireId, (q) => ({ ...q, name: label, last_updated: updatedAt }))
      );
      try {
        await postQuestionnaireAction("update_questionnaire", {
          questionnaireId,
          patch: { name: label, last_updated: updatedAt },
        });
      } catch (err) {
        console.error("Failed to update questionnaire", err);
        if (previous) {
          setQuestionnaires((prev) => updateQuestionnaireList(prev, questionnaireId, () => previous));
        }
      }
    },
    [questionnaires]
  );

  const deleteQuestionnaire = useCallback(async (questionnaireId: string) => {
    await postQuestionnaireAction("delete_questionnaire", { questionnaireId });
    setQuestionnaires((prev) => prev.filter((q) => q.id !== questionnaireId));
  }, []);

  const addQuestion = useCallback(
    async (questionnaireId: string, question: Omit<Question, "id">) => {
      const target = questionnaires.find((q) => q.id === questionnaireId);
      const newQuestion: Question = {
        ...question,
        id: `q_${slugify(question.label).replace(/-[a-z0-9]{5}$/, "")}_${Date.now()
          .toString(36)
          .slice(-4)}`,
      };
      const orderIndex = ((target?.questions.length ?? 0) + 1) * 10;
      setQuestionnaires((prev) =>
        updateQuestionnaireList(prev, questionnaireId, (q) => ({
          ...q,
          last_updated: nowIso(),
          questions: [...q.questions, newQuestion],
        }))
      );
      try {
        await postQuestionnaireAction("add_question", {
          question: questionToInsertRow(
            newQuestion,
            { questionnaire_id: questionnaireId, client_id: null },
            orderIndex
          ),
        });
      } catch (err) {
        console.error("Failed to add question", err);
        setQuestionnaires((prev) =>
          updateQuestionnaireList(prev, questionnaireId, (q) => ({
            ...q,
            questions: q.questions.filter((existing) => existing.id !== newQuestion.id),
          }))
        );
      }
      return newQuestion;
    },
    [questionnaires]
  );

  const updateQuestion = useCallback(
    async (questionnaireId: string, questionId: string, patch: Partial<Omit<Question, "id">>) => {
      setQuestionnaires((prev) =>
        updateQuestionnaireList(prev, questionnaireId, (q) => ({
          ...q,
          last_updated: nowIso(),
          questions: q.questions.map((existing) =>
            existing.id === questionId ? { ...existing, ...patch } : existing
          ),
        }))
      );
      try {
        await postQuestionnaireAction("update_question", {
          questionId,
          patch: {
            ...(patch.section !== undefined ? { section: patch.section } : {}),
            ...(patch.label !== undefined ? { label: patch.label } : {}),
            ...(patch.field_type !== undefined ? { field_type: patch.field_type } : {}),
            ...(patch.is_repeatable !== undefined ? { is_repeatable: patch.is_repeatable } : {}),
            ...(patch.options !== undefined ? { options: patch.options ?? null } : {}),
            ...(patch.placeholder !== undefined ? { placeholder: patch.placeholder ?? null } : {}),
          },
        });
      } catch (err) {
        console.error("Failed to update question", err);
      }
    },
    []
  );

  const removeQuestion = useCallback(async (questionnaireId: string, questionId: string) => {
    setQuestionnaires((prev) =>
      updateQuestionnaireList(prev, questionnaireId, (q) => ({
        ...q,
        last_updated: nowIso(),
        questions: q.questions.filter((existing) => existing.id !== questionId),
      }))
    );
    try {
      await postQuestionnaireAction("remove_question", { questionId });
    } catch (err) {
      console.error("Failed to remove question", err);
    }
  }, []);

  const moveQuestion = useCallback(
    async (questionnaireId: string, questionId: string, direction: "up" | "down") => {
      const target = questionnaires.find((q) => q.id === questionnaireId);
      if (!target) return;
      const reordered = reorderWithinSection(target.questions, questionId, direction === "up" ? -1 : 1);
      setQuestionnaires((prev) =>
        updateQuestionnaireList(prev, questionnaireId, (q) => ({
          ...q,
          last_updated: nowIso(),
          questions: reordered,
        }))
      );
      try {
        await persistOrder(reordered);
      } catch (err) {
        console.error("Failed to persist question order", err);
      }
    },
    [questionnaires]
  );

  const moveSection = useCallback(
    async (questionnaireId: string, section: string, direction: "up" | "down") => {
      const target = questionnaires.find((q) => q.id === questionnaireId);
      if (!target) return;
      const reordered = reorderSections(target.questions, section, direction === "up" ? -1 : 1);
      setQuestionnaires((prev) =>
        updateQuestionnaireList(prev, questionnaireId, (q) => ({
          ...q,
          last_updated: nowIso(),
          questions: reordered,
        }))
      );
      try {
        await persistOrder(reordered);
      } catch (err) {
        console.error("Failed to persist section order", err);
      }
    },
    [questionnaires]
  );

  const value = useMemo<QuestionnaireStoreValue>(
    () => ({
      questionnaires,
      isHydrated,
      getQuestionnaire,
      createQuestionnaire,
      updateQuestionnaire,
      deleteQuestionnaire,
      addQuestion,
      updateQuestion,
      removeQuestion,
      moveQuestion,
      moveSection,
    }),
    [
      questionnaires,
      isHydrated,
      getQuestionnaire,
      createQuestionnaire,
      updateQuestionnaire,
      deleteQuestionnaire,
      addQuestion,
      updateQuestion,
      removeQuestion,
      moveQuestion,
      moveSection,
    ]
  );

  return (
    <QuestionnaireStoreContext.Provider value={value}>{children}</QuestionnaireStoreContext.Provider>
  );
}

export function useQuestionnaireStore() {
  const ctx = useContext(QuestionnaireStoreContext);
  if (!ctx) throw new Error("useQuestionnaireStore must be used within QuestionnaireStoreProvider");
  return ctx;
}
