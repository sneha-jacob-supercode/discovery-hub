"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  EyeOff,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Undo2,
} from "lucide-react";
import { Client, Question, Questionnaire } from "@/lib/types";
import { allQuestionsForClient, answerPreview, hiddenQuestionsForClient } from "@/lib/status";
import { questionsBySection } from "@/lib/questions";
import { AddQuestionForm, QuestionFormPayload } from "./AddQuestionForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type FormMode = { type: "add" } | { type: "edit"; question: Question };

type RowStatus = "current" | "answered" | "skipped" | "upcoming";

function rowStatus(question: Question, currentId: string | null, client: Client): RowStatus {
  if (question.id === currentId) return "current";
  const answer = client.answers[question.id];
  if (answer?.status === "answered") return "answered";
  if (answer?.status === "skipped") return "skipped";
  return "upcoming";
}

const STATUS_LABEL: Record<RowStatus, string> = {
  answered: "Answered",
  current: "Current question",
  skipped: "Skipped",
  upcoming: "Upcoming",
};

function StatusIcon({ status }: { status: RowStatus }) {
  switch (status) {
    case "answered":
      return (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} aria-hidden="true" />
        </span>
      );
    case "current":
      return (
        <span className="flex h-4 w-4 items-center justify-center">
          <ChevronRight className="h-4 w-4 text-ink" aria-hidden="true" />
        </span>
      );
    case "skipped":
      return (
        <span className="flex h-4 w-4 items-center justify-center">
          <Minus className="h-4 w-4 text-warning" aria-hidden="true" />
        </span>
      );
    case "upcoming":
      return (
        <span className="flex h-4 w-4 items-center justify-center">
          <Circle className="h-4 w-4 text-line-strong" aria-hidden="true" />
        </span>
      );
  }
}

interface SidePanelProps {
  client: Client;
  questionnaire: Questionnaire;
  currentId: string | null;
  mode: "internal" | "public";
  onSelect: (id: string) => void;
  onAddQuestion?: (payload: QuestionFormPayload) => void;
  onUpdateQuestion?: (question: Question, payload: QuestionFormPayload) => void;
  onHideQuestion?: (id: string) => void;
  onUnhideQuestion?: (id: string) => void;
}

export function SidePanel({
  client,
  questionnaire,
  currentId,
  mode,
  onSelect,
  onAddQuestion,
  onUpdateQuestion,
  onHideQuestion,
  onUnhideQuestion,
}: SidePanelProps) {
  const isInternal = mode === "internal";
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [pendingHideId, setPendingHideId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const grouped = questionsBySection(allQuestionsForClient(client, questionnaire));
  const hidden = isInternal ? hiddenQuestionsForClient(client, questionnaire) : [];

  useEffect(() => {
    if (!menuOpenId) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
        {grouped.map(({ section, questions }) => (
          <div key={section} className="mb-6">
            <p className="mb-2 font-mono text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint">
              {section}
            </p>
            <ul className="space-y-0.5">
              {questions.map((q) => {
                const status = rowStatus(q, currentId, client);
                const preview = answerPreview(client.answers[q.id]);
                return (
                  <li key={q.id} className="group/row flex items-center gap-1">
                    <button
                      onClick={() => onSelect(q.id)}
                      className={`flex w-full flex-1 items-start gap-2.5 rounded-md px-3 py-2.5 text-left outline-hidden transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong ${
                        status === "current" ? "bg-line" : "hover:bg-paper"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        <StatusIcon status={status} />
                        <span className="sr-only">{STATUS_LABEL[status]}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[0.8125rem] leading-snug ${
                            status === "current"
                              ? "font-semibold text-ink"
                              : status === "skipped"
                                ? "text-ink-faint line-through"
                                : status === "upcoming"
                                  ? "text-ink-muted"
                                  : "text-ink"
                          }`}
                        >
                          {q.label}
                        </span>
                        {preview && status !== "current" && (
                          <span className="block truncate text-[0.6875rem] text-ink-faint">{preview}</span>
                        )}
                      </span>
                    </button>
                    {isInternal && (
                      <div
                        ref={menuOpenId === q.id ? menuRef : undefined}
                        className="relative shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() => setMenuOpenId((open) => (open === q.id ? null : q.id))}
                          aria-label={`More actions for "${q.label}"`}
                          aria-expanded={menuOpenId === q.id}
                          className={`rounded-md p-1.5 text-ink-faint transition hover:bg-paper hover:text-ink focus-visible:opacity-100 group-hover/row:opacity-100 ${
                            menuOpenId === q.id ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        {menuOpenId === q.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                setFormMode({ type: "edit", question: q });
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition hover:bg-paper"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                setPendingHideId(q.id);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition hover:bg-paper hover:text-warning"
                            >
                              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                              Hide
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {hidden.length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => setShowHidden((v) => !v)}
              className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-left font-mono text-[0.6875rem] font-medium uppercase tracking-wider text-ink-faint hover:text-ink"
            >
              <ChevronDown
                className={`h-3 w-3 transition ${showHidden ? "" : "-rotate-90"}`}
                aria-hidden="true"
              />
              Hidden questions ({hidden.length})
            </button>
            {showHidden && (
              <ul className="space-y-0.5">
                {hidden.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-[0.8125rem] text-ink-faint"
                  >
                    <span className="min-w-0 flex-1 truncate">{q.label}</span>
                    {q.is_custom && (
                      <span className="shrink-0 rounded border border-line-strong px-1 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wide">
                        Custom
                      </span>
                    )}
                    <button
                      onClick={() => onUnhideQuestion?.(q.id)}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink"
                    >
                      <Undo2 className="h-3 w-3" aria-hidden="true" />
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {isInternal && pendingHideId && (
        <ConfirmDialog
          title={`Remove this question for ${client.name}?`}
          description="This only affects this client — the shared questionnaire template and other clients are unaffected. You can restore it anytime from Hidden Questions below."
          confirmLabel="Remove"
          onCancel={() => setPendingHideId(null)}
          onConfirm={() => {
            onHideQuestion?.(pendingHideId);
            setPendingHideId(null);
          }}
        />
      )}

      {isInternal && (
        <div className="border-t border-line p-4">
          {formMode ? (
            <AddQuestionForm
              sections={grouped.map((g) => g.section)}
              initial={formMode.type === "edit" ? formMode.question : undefined}
              onCancel={() => setFormMode(null)}
              onSubmit={(payload) => {
                if (formMode.type === "edit") {
                  onUpdateQuestion?.(formMode.question, payload);
                } else {
                  onAddQuestion?.(payload);
                }
                setFormMode(null);
              }}
            />
          ) : (
            <button
              onClick={() => setFormMode({ type: "add" })}
              className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-ink-muted outline-hidden transition hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Question
            </button>
          )}
        </div>
      )}
    </div>
  );
}
