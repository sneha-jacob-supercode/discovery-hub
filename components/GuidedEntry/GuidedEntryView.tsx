"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { orderedQuestionsForClient, firstOpenQuestion, getProgress } from "@/lib/status";
import { AnswerValue, Answer, Client, Question, Questionnaire } from "@/lib/types";
import { SidePanel } from "./SidePanel";
import { QuestionPanel } from "./QuestionPanel";
import { Button } from "@/components/ui/Button";

function hasValue(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  return false;
}

function findNextOpenIndex(
  list: { id: string }[],
  fromIndex: number,
  answers: Record<string, Answer>
): number {
  for (let i = fromIndex + 1; i < list.length; i++) {
    if (answers[list[i].id]?.status !== "answered") return i;
  }
  return -1;
}

export interface GuidedEntryActions {
  saveAnswer: (questionId: string, value: AnswerValue) => void;
  addEntry: (questionId: string, value: AnswerValue) => void;
  removeEntry: (questionId: string, index: number) => void;
  skipQuestion: (questionId: string) => void;
  addCustomQuestion?: (question: Omit<Question, "id" | "is_custom">) => void;
  hideQuestion?: (questionId: string) => void;
  unhideQuestion?: (questionId: string) => void;
}

export function GuidedEntryView({
  client,
  questionnaire,
  mode,
  actions,
  initialQuestionId,
}: {
  client: Client;
  questionnaire: Questionnaire;
  mode: "internal" | "public";
  actions: GuidedEntryActions;
  initialQuestionId?: string;
}) {
  const isInternal = mode === "internal";

  const flatQuestions = useMemo(
    () => orderedQuestionsForClient(client, questionnaire),
    [client, questionnaire]
  );

  const [currentId, setCurrentId] = useState<string | null>(
    () => initialQuestionId ?? firstOpenQuestion(client, questionnaire)?.id ?? null
  );
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const progress = getProgress(client, questionnaire);
  const currentIndex = currentId ? flatQuestions.findIndex((q) => q.id === currentId) : -1;
  const currentQuestion = currentIndex >= 0 ? flatQuestions[currentIndex] : undefined;

  function advanceFrom(question: Question, index: number, resultStatus: "answered" | "skipped") {
    const effectiveAnswers = { ...client.answers, [question.id]: { status: resultStatus } };
    const next = findNextOpenIndex(flatQuestions, index, effectiveAnswers);
    setCurrentId(next === -1 ? null : flatQuestions[next].id);
  }

  function handleSaveNext(question: Question, index: number, value: AnswerValue | undefined) {
    if (question.is_repeatable) {
      if (hasValue(value)) {
        actions.addEntry(question.id, value!);
      } else if ((client.answers[question.id]?.entries?.length ?? 0) === 0) {
        return;
      }
    } else {
      if (!hasValue(value)) return;
      actions.saveAnswer(question.id, value!);
    }
    advanceFrom(question, index, "answered");
  }

  function handleAddAnother(question: Question, value: AnswerValue | undefined) {
    if (!hasValue(value)) return;
    actions.addEntry(question.id, value!);
  }

  function handleSkip(question: Question, index: number) {
    actions.skipQuestion(question.id);
    advanceFrom(question, index, "skipped");
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentId(flatQuestions[currentIndex - 1].id);
  }

  function handleHideQuestion(questionId: string) {
    actions.hideQuestion?.(questionId);
    if (questionId === currentId) {
      const idx = flatQuestions.findIndex((q) => q.id === questionId);
      const remaining = flatQuestions.filter((q) => q.id !== questionId);
      const fallback = remaining[Math.min(idx, remaining.length - 1)];
      setCurrentId(fallback ? fallback.id : null);
    }
  }

  const pct = progress.total === 0 ? 0 : Math.round((progress.answered / progress.total) * 100);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2 md:hidden">
        <button
          onClick={() => setSidePanelOpen(true)}
          className="rounded-full border border-line px-2.5 py-1.5 text-xs font-medium text-ink-muted"
        >
          Outline
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[0.6875rem] text-ink-faint">{pct}%</span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Side panel — static on desktop, drawer on mobile */}
        <div className="hidden w-[22.5rem] shrink-0 border-r border-line bg-surface md:block">
          <SidePanel
            client={client}
            questionnaire={questionnaire}
            currentId={currentId}
            mode={mode}
            onSelect={(id) => setCurrentId(id)}
            onAddQuestion={isInternal ? (payload) => actions.addCustomQuestion?.(payload) : undefined}
            onHideQuestion={isInternal ? handleHideQuestion : undefined}
            onUnhideQuestion={isInternal ? (id) => actions.unhideQuestion?.(id) : undefined}
          />
        </div>

        {sidePanelOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidePanelOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[22.5rem] max-w-[85vw] overflow-hidden bg-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm font-medium text-ink">Question outline</span>
                <button
                  onClick={() => setSidePanelOpen(false)}
                  className="text-sm text-ink-muted hover:text-ink"
                >
                  Close
                </button>
              </div>
              <div className="h-[calc(100%-3.0625rem)]">
                <SidePanel
                  client={client}
                  questionnaire={questionnaire}
                  currentId={currentId}
                  mode={mode}
                  onSelect={(id) => {
                    setCurrentId(id);
                    setSidePanelOpen(false);
                  }}
                  onAddQuestion={isInternal ? (payload) => actions.addCustomQuestion?.(payload) : undefined}
                  onHideQuestion={isInternal ? handleHideQuestion : undefined}
                  onUnhideQuestion={isInternal ? (id) => actions.unhideQuestion?.(id) : undefined}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {currentQuestion ? (
            <QuestionRuntime
              key={currentQuestion.id}
              client={client}
              question={currentQuestion}
              index={currentIndex}
              total={flatQuestions.length}
              canBack={currentIndex > 0}
              onSaveNext={(value) => handleSaveNext(currentQuestion, currentIndex, value)}
              onAddAnother={(value) => handleAddAnother(currentQuestion, value)}
              onSkip={() => handleSkip(currentQuestion, currentIndex)}
              onBack={handleBack}
              onRemoveEntry={(idx) => actions.removeEntry(currentQuestion.id, idx)}
            />
          ) : (
            <DoneScreen
              mode={mode}
              onReviewSkipped={() => {
                const skippedQ = flatQuestions.find((q) => client.answers[q.id]?.status === "skipped");
                if (skippedQ) setCurrentId(skippedQ.id);
              }}
              hasSkipped={flatQuestions.some((q) => client.answers[q.id]?.status === "skipped")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Owns the draft input for exactly one question. Keying this on the
// question id (see the `key={currentQuestion.id}` above) gives it a fresh
// `draft` state for free on every navigation, instead of syncing it via an
// effect.
function QuestionRuntime({
  client,
  question,
  index,
  total,
  canBack,
  onSaveNext,
  onAddAnother,
  onSkip,
  onBack,
  onRemoveEntry,
}: {
  client: Client;
  question: Question;
  index: number;
  total: number;
  canBack: boolean;
  onSaveNext: (value: AnswerValue | undefined) => void;
  onAddAnother: (value: AnswerValue | undefined) => void;
  onSkip: () => void;
  onBack: () => void;
  onRemoveEntry: (index: number) => void;
}) {
  const [draft, setDraft] = useState<AnswerValue | undefined>(() => {
    if (question.is_repeatable) return undefined;
    const existing = client.answers[question.id]?.value;
    // Ranking questions start pre-filled with their default order so the
    // current arrangement is itself a valid, immediately-savable answer.
    if (existing === undefined && question.field_type === "ranking") return question.options ?? [];
    return existing;
  });

  const entries = client.answers[question.id]?.entries ?? [];
  const canSave = hasValue(draft) || (question.is_repeatable && entries.length > 0);

  function handleKeyDown(e: React.KeyboardEvent) {
    const target = e.target as HTMLElement;
    const isTextarea = target.tagName === "TEXTAREA";
    if (e.key === "Enter") {
      if (isTextarea && !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      onSaveNext(draft);
    } else if (e.altKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSkip();
    } else if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      onBack();
    }
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <QuestionPanel
        question={question}
        sectionLabel={question.section}
        positionLabel={`${index + 1} of ${total}`}
        value={draft}
        onChange={setDraft}
        entries={entries}
        onRemoveEntry={onRemoveEntry}
        canSave={canSave}
        canBack={canBack}
        onSaveNext={() => onSaveNext(draft)}
        onAddAnother={() => {
          if (!hasValue(draft)) return;
          onAddAnother(draft);
          setDraft(undefined);
        }}
        onSkip={onSkip}
        onBack={onBack}
      />
    </div>
  );
}

function DoneScreen({
  mode,
  hasSkipped,
  onReviewSkipped,
}: {
  mode: "internal" | "public";
  hasSkipped: boolean;
  onReviewSkipped: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="w-full rounded-lg border border-success-line bg-success-soft px-6 py-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink">
          {mode === "public" ? "Thanks — we've got everything we need" : "You&apos;re Answers have been Saved"}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {mode === "public"
            ? hasSkipped
              ? "We'll follow up on anything you skipped if we need more detail."
              : "You can close this tab now."
            : hasSkipped
              ? "A few were skipped — you can revisit them here or from the outline anytime."
              : "Nice work. We'll get back to you with the next steps!"}
        </p>
        {mode === "internal" && hasSkipped && (
          <Button variant="secondary" onClick={onReviewSkipped} className="mt-5">
            Review skipped questions
          </Button>
        )}
      </div>
    </div>
  );
}
