"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Question, Questionnaire } from "./types";
import { SEED_QUESTIONNAIRES, QUESTIONNAIRE_SEED_VERSION } from "./questionnaireSeed";

const STORAGE_KEY = "client-intake-prototype:questionnaires:v1";

interface StoredEnvelope {
  seedVersion: number;
  questionnaires: Questionnaire[];
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

interface QuestionnaireStoreValue {
  questionnaires: Questionnaire[];
  isHydrated: boolean;
  getQuestionnaire: (id: string) => Questionnaire | undefined;
  createQuestionnaire: (name: string) => Questionnaire;
  addQuestion: (questionnaireId: string, question: Omit<Question, "id">) => Question;
  updateQuestion: (
    questionnaireId: string,
    questionId: string,
    patch: Partial<Omit<Question, "id">>
  ) => void;
  removeQuestion: (questionnaireId: string, questionId: string) => void;
}

const QuestionnaireStoreContext = createContext<QuestionnaireStoreValue | null>(null);

function updateQuestionnaireList(
  list: Questionnaire[],
  id: string,
  patch: (q: Questionnaire) => Questionnaire
): Questionnaire[] {
  return list.map((q) => (q.id === id ? patch(q) : q));
}

export function QuestionnaireStoreProvider({ children }: { children: React.ReactNode }) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(SEED_QUESTIONNAIRES);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydratedFromStorage = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredEnvelope | Questionnaire[];
        // Old un-versioned format (bare array) or a stale seed version both
        // count as stale — fall through and keep the fresh seed default.
        if (
          !Array.isArray(parsed) &&
          parsed.seedVersion === QUESTIONNAIRE_SEED_VERSION &&
          Array.isArray(parsed.questionnaires) &&
          parsed.questionnaires.length > 0
        ) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setQuestionnaires(parsed.questionnaires);
        }
      }
    } catch {
      // ignore malformed storage, fall back to seed data
    } finally {
      hasHydratedFromStorage.current = true;
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedFromStorage.current) return;
    const envelope: StoredEnvelope = { seedVersion: QUESTIONNAIRE_SEED_VERSION, questionnaires };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  }, [questionnaires]);

  const getQuestionnaire = useCallback(
    (id: string) => questionnaires.find((q) => q.id === id),
    [questionnaires]
  );

  const createQuestionnaire = useCallback((name: string) => {
    const label = name.trim() || "New Questionnaire";
    const questionnaire: Questionnaire = {
      id: slugify(label),
      name: label,
      questions: [],
      created_at: nowIso(),
      last_updated: nowIso(),
    };
    setQuestionnaires((prev) => [questionnaire, ...prev]);
    return questionnaire;
  }, []);

  const addQuestion = useCallback((questionnaireId: string, question: Omit<Question, "id">) => {
    const newQuestion: Question = {
      ...question,
      id: `q_${slugify(question.label).replace(/-[a-z0-9]{5}$/, "")}_${Date.now().toString(36).slice(-4)}`,
    };
    setQuestionnaires((prev) =>
      updateQuestionnaireList(prev, questionnaireId, (q) => ({
        ...q,
        last_updated: nowIso(),
        questions: [...q.questions, newQuestion],
      }))
    );
    return newQuestion;
  }, []);

  const updateQuestion = useCallback(
    (questionnaireId: string, questionId: string, patch: Partial<Omit<Question, "id">>) => {
      setQuestionnaires((prev) =>
        updateQuestionnaireList(prev, questionnaireId, (q) => ({
          ...q,
          last_updated: nowIso(),
          questions: q.questions.map((existing) =>
            existing.id === questionId ? { ...existing, ...patch } : existing
          ),
        }))
      );
    },
    []
  );

  const removeQuestion = useCallback((questionnaireId: string, questionId: string) => {
    setQuestionnaires((prev) =>
      updateQuestionnaireList(prev, questionnaireId, (q) => ({
        ...q,
        last_updated: nowIso(),
        questions: q.questions.filter((existing) => existing.id !== questionId),
      }))
    );
  }, []);

  const value = useMemo<QuestionnaireStoreValue>(
    () => ({
      questionnaires,
      isHydrated,
      getQuestionnaire,
      createQuestionnaire,
      addQuestion,
      updateQuestion,
      removeQuestion,
    }),
    [questionnaires, isHydrated, getQuestionnaire, createQuestionnaire, addQuestion, updateQuestion, removeQuestion]
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
