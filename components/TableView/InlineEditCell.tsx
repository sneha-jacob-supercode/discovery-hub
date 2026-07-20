"use client";

import { useEffect, useRef, useState } from "react";
import { Answer, AnswerValue, Question } from "@/lib/types";
import { InputByType } from "@/components/GuidedEntry/InputByType";

function formatEntry(value: AnswerValue): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// Field types that commit as soon as a selection is made (no separate
// "save" step needed, unlike free text which needs blur/Enter to commit).
const AUTO_COMMIT_TYPES: Question["field_type"][] = ["single_select", "multi_select", "boolean"];

interface InlineEditCellProps {
  question: Question;
  answer: Answer | undefined;
  onSave: (value: AnswerValue) => void;
  onAddEntry: (value: AnswerValue) => void;
  onRemoveEntry: (index: number) => void;
}

export function InlineEditCell({ question, answer, onSave, onAddEntry, onRemoveEntry }: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<AnswerValue | undefined>(answer?.value);
  const cellRef = useRef<HTMLDivElement>(null);

  function openEditor() {
    setDraft(answer?.value ?? (question.field_type === "ranking" ? question.options : undefined));
    setIsEditing(true);
  }

  useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  if (question.is_repeatable) {
    const entries = answer?.entries ?? [];
    if (!isEditing) {
      return (
        <button
          onClick={() => setIsEditing(true)}
          className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-paper"
        >
          {/* repeatable: the entry input always starts blank, no draft to seed */}
          {entries.length > 0 ? (
            <span className="text-ink">{entries.map(formatEntry).join(" · ")}</span>
          ) : (
            <span className="text-ink-faint">Click to add…</span>
          )}
        </button>
      );
    }
    return (
      <div ref={cellRef} className="space-y-1.5 rounded-md border border-line-strong bg-surface p-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded bg-paper px-2 py-1 text-xs">
            <span className="min-w-0 flex-1 truncate text-ink-muted">{formatEntry(entry)}</span>
            <button onClick={() => onRemoveEntry(i)} className="shrink-0 text-ink-faint hover:text-warning">
              Remove
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="flex-1">
            <InputByType question={question} value={draft} onChange={setDraft} />
          </div>
          <button
            onClick={() => {
              if (draft === undefined || draft === "") return;
              onAddEntry(draft);
              setDraft(undefined);
            }}
            className="shrink-0 rounded-full bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:bg-ink/90"
          >
            Add
          </button>
        </div>
        <button onClick={() => setIsEditing(false)} className="text-xs font-medium text-ink hover:underline">
          Done
        </button>
      </div>
    );
  }

  if (!isEditing) {
    const preview = answer?.status === "answered" ? formatEntry(answer.value ?? "") : "";
    return (
      <button
        onClick={openEditor}
        className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-paper"
      >
        {preview ? <span className="text-ink">{preview}</span> : <span className="text-ink-faint">Click to add…</span>}
      </button>
    );
  }

  function commitAndClose() {
    if (draft !== undefined && draft !== "") onSave(draft);
    setIsEditing(false);
  }

  return (
    <div
      ref={cellRef}
      className="rounded-md border border-line-strong bg-surface p-2"
      onKeyDown={(e) => {
        if (e.key === "Enter" && question.field_type !== "long_text") {
          e.preventDefault();
          commitAndClose();
        } else if (e.key === "Escape") {
          setIsEditing(false);
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          if (question.field_type === "short_text" || question.field_type === "long_text") commitAndClose();
        }
      }}
    >
      <InputByType
        question={question}
        value={draft}
        onChange={(v) => {
          setDraft(v);
          if (question.field_type === "ranking") {
            // Each reorder move saves immediately but keeps the cell open —
            // ranking is a multi-step interaction, unlike a single selection.
            onSave(v);
          } else if (AUTO_COMMIT_TYPES.includes(question.field_type)) {
            onSave(v);
            setIsEditing(false);
          }
        }}
      />
    </div>
  );
}
