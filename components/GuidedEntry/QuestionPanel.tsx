"use client";

import { AnswerValue, Question } from "@/lib/types";
import { InputByType } from "./InputByType";
import { ActionRow } from "./ActionRow";

function formatEntry(value: AnswerValue): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

interface QuestionPanelProps {
  question: Question;
  sectionLabel: string;
  positionLabel: string;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  entries: AnswerValue[];
  onRemoveEntry: (index: number) => void;
  canSave: boolean;
  canBack: boolean;
  onSaveNext: () => void;
  onAddAnother: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function QuestionPanel({
  question,
  sectionLabel,
  positionLabel,
  value,
  onChange,
  entries,
  onRemoveEntry,
  canSave,
  canBack,
  onSaveNext,
  onAddAnother,
  onSkip,
  onBack,
}: QuestionPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        {sectionLabel} · {positionLabel}
      </p>
      <h2 className="mt-3 text-2xl font-semibold leading-snug text-ink sm:text-[28px]">
        {question.label}
      </h2>

      {question.is_repeatable && entries.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {entries.map((entry, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink-muted"
            >
              <span className="min-w-0 flex-1 truncate">{formatEntry(entry)}</span>
              <button
                onClick={() => onRemoveEntry(i)}
                className="shrink-0 text-xs text-ink-faint transition hover:text-warning"
                aria-label="Remove entry"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <InputByType question={question} value={value} onChange={onChange} />
      </div>

      <div className="mt-8">
        <ActionRow
          isRepeatable={question.is_repeatable}
          canSave={canSave}
          canBack={canBack}
          onSaveNext={onSaveNext}
          onAddAnother={onAddAnother}
          onSkip={onSkip}
          onBack={onBack}
        />
      </div>
    </div>
  );
}
