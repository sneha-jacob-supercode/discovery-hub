"use client";

import { useState } from "react";
import { EyeOff, Pencil } from "lucide-react";
import { Answer, AnswerValue, Question } from "@/lib/types";
import { InlineEditCell } from "./InlineEditCell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const STATUS_TEXT: Record<"answered" | "skipped" | "n/a", string> = {
  answered: "Answered",
  skipped: "Skipped",
  "n/a": "N/A",
};

const STATUS_CLASS: Record<"answered" | "skipped" | "n/a", string> = {
  answered: "text-success",
  skipped: "text-warning",
  "n/a": "text-ink-faint",
};

interface TableRowProps {
  question: Question;
  answer: Answer | undefined;
  onSave: (value: AnswerValue) => void;
  onAddEntry: (value: AnswerValue) => void;
  onRemoveEntry: (index: number) => void;
  onJumpToGuided: () => void;
  onHide: () => void;
}

export function TableRow({
  question,
  answer,
  onSave,
  onAddEntry,
  onRemoveEntry,
  onJumpToGuided,
  onHide,
}: TableRowProps) {
  const status = answer?.status ?? "n/a";
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-paper/60" onDoubleClick={onJumpToGuided}>
      <td className="w-[30%] px-3 py-2.5 align-top">
        <span className="text-sm text-ink">{question.label}</span>
        {question.is_custom && (
          <span className="ml-1.5 rounded border border-line-strong px-1 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            Custom
          </span>
        )}
      </td>
      <td className="px-1 py-1 align-top">
        <InlineEditCell question={question} answer={answer} onSave={onSave} onAddEntry={onAddEntry} onRemoveEntry={onRemoveEntry} />
      </td>
      <td className="w-28 px-3 py-2.5 align-top">
        <span className={`text-xs font-medium ${STATUS_CLASS[status]}`}>{STATUS_TEXT[status]}</span>
      </td>
      <td className="w-28 px-3 py-2.5 text-right align-top">
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onJumpToGuided}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition hover:text-ink focus-visible:text-ink"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            aria-label={`Remove "${question.label}" from this client`}
            className="text-ink-faint transition hover:text-warning focus-visible:text-warning"
          >
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        {showConfirm && (
          <ConfirmDialog
            title={`Remove "${question.label}"?`}
            description="This only removes it from this client's questionnaire — the shared template and other clients are unaffected. You can restore it later from Guided Entry → Hidden Questions."
            confirmLabel="Remove"
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => {
              onHide();
              setShowConfirm(false);
            }}
          />
        )}
      </td>
    </tr>
  );
}
