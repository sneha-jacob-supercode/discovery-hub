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
import { Answer, AnswerValue, Client, Question } from "./types";
import { SEED_CLIENTS } from "./seedData";

const STORAGE_KEY = "client-intake-prototype:clients:v1";

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

interface ClientStoreValue {
  clients: Client[];
  isHydrated: boolean;
  getClient: (id: string) => Client | undefined;
  createClient: (questionnaireId: string, name?: string) => Client;
  deleteClient: (clientId: string) => void;
  duplicateClient: (clientId: string) => Client | undefined;
  saveAnswer: (clientId: string, questionId: string, value: AnswerValue) => void;
  addEntry: (clientId: string, questionId: string, value: AnswerValue) => void;
  removeEntry: (clientId: string, questionId: string, index: number) => void;
  skipQuestion: (clientId: string, questionId: string) => void;
  addCustomQuestion: (
    clientId: string,
    question: Omit<Question, "id" | "is_custom">
  ) => Question;
  hideQuestion: (clientId: string, questionId: string) => void;
  unhideQuestion: (clientId: string, questionId: string) => void;
}

const ClientStoreContext = createContext<ClientStoreValue | null>(null);

function updateClient(clients: Client[], clientId: string, patch: (c: Client) => Client): Client[] {
  return clients.map((c) => (c.id === clientId ? patch(c) : c));
}

export function ClientStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydratedFromStorage = useRef(false);

  // localStorage doesn't exist during SSR, so hydrating from it has to happen
  // post-mount — the seed data above is what the server-rendered markup uses.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Client[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Heal records saved before questionnaire_id existed — default them
          // to Long Form so they don't silently disappear from the list.
          const healed = parsed.map((c) => ({
            ...c,
            questionnaire_id: c.questionnaire_id ?? "long-form",
            hidden_question_ids: c.hidden_question_ids ?? [],
          }));
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setClients(healed);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  const getClient = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);

  const createClient = useCallback((questionnaireId: string, name?: string) => {
    const label = name?.trim() || "New Client";
    const client: Client = {
      id: slugify(label),
      name: label,
      created_at: nowIso(),
      last_updated: nowIso(),
      answers: {},
      custom_questions: [],
      hidden_question_ids: [],
      questionnaire_id: questionnaireId,
    };
    setClients((prev) => [client, ...prev]);
    return client;
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
  }, []);

  const duplicateClient = useCallback(
    (clientId: string) => {
      const original = clients.find((c) => c.id === clientId);
      if (!original) return undefined;
      const name = `${original.name} (Copy)`;
      const duplicate: Client = {
        ...structuredClone(original),
        id: slugify(name),
        name,
        created_at: nowIso(),
        last_updated: nowIso(),
      };
      setClients((prev) => [duplicate, ...prev]);
      return duplicate;
    },
    [clients]
  );

  const saveAnswer = useCallback((clientId: string, questionId: string, value: AnswerValue) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => {
        const answer: Answer = { status: "answered", value };
        return {
          ...c,
          last_updated: nowIso(),
          answers: { ...c.answers, [questionId]: answer },
        };
      })
    );
  }, []);

  const addEntry = useCallback((clientId: string, questionId: string, value: AnswerValue) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => {
        const existing = c.answers[questionId];
        const entries = [...(existing?.entries ?? []), value];
        const answer: Answer = { status: "answered", entries };
        return {
          ...c,
          last_updated: nowIso(),
          answers: { ...c.answers, [questionId]: answer },
        };
      })
    );
  }, []);

  const removeEntry = useCallback((clientId: string, questionId: string, index: number) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => {
        const existing = c.answers[questionId];
        if (!existing?.entries) return c;
        const entries = existing.entries.filter((_, i) => i !== index);
        const answer: Answer = {
          status: entries.length > 0 ? "answered" : "skipped",
          entries,
        };
        return {
          ...c,
          last_updated: nowIso(),
          answers: { ...c.answers, [questionId]: answer },
        };
      })
    );
  }, []);

  const skipQuestion = useCallback((clientId: string, questionId: string) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => {
        const answer: Answer = { status: "skipped" };
        return {
          ...c,
          last_updated: nowIso(),
          answers: { ...c.answers, [questionId]: answer },
        };
      })
    );
  }, []);

  const addCustomQuestion = useCallback(
    (clientId: string, question: Omit<Question, "id" | "is_custom">) => {
      const newQuestion: Question = {
        ...question,
        id: `custom_${slugify(question.label).replace(/-[a-z0-9]{5}$/, "")}_${Date.now()
          .toString(36)
          .slice(-4)}`,
        is_custom: true,
      };
      setClients((prev) =>
        updateClient(prev, clientId, (c) => ({
          ...c,
          last_updated: nowIso(),
          custom_questions: [...c.custom_questions, newQuestion],
        }))
      );
      return newQuestion;
    },
    []
  );

  const hideQuestion = useCallback((clientId: string, questionId: string) => {
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
  }, []);

  const unhideQuestion = useCallback((clientId: string, questionId: string) => {
    setClients((prev) =>
      updateClient(prev, clientId, (c) => ({
        ...c,
        last_updated: nowIso(),
        hidden_question_ids: c.hidden_question_ids.filter((id) => id !== questionId),
      }))
    );
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
    ]
  );

  return <ClientStoreContext.Provider value={value}>{children}</ClientStoreContext.Provider>;
}

export function useClientStore() {
  const ctx = useContext(ClientStoreContext);
  if (!ctx) throw new Error("useClientStore must be used within ClientStoreProvider");
  return ctx;
}
