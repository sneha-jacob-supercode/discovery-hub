"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { AnswerValue, Question } from "@/lib/types";

interface InputByTypeProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

export function InputByType({ question, value, onChange }: InputByTypeProps) {
  switch (question.field_type) {
    case "short_text":
      return (
        <input
          autoFocus
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
      );

    case "long_text":
      return (
        <textarea
          autoFocus
          rows={5}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer… (⌘/Ctrl + Enter to save)"}
          className="w-full resize-none rounded-lg border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
      );

    case "single_select": {
      const current = (value as string) ?? "";
      return (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                current === opt
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    case "multi_select": {
      const current = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((opt) => {
            const active = current.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  onChange(active ? current.filter((v) => v !== opt) : [...current, opt])
                }
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    case "boolean": {
      const current = typeof value === "boolean" ? value : undefined;
      return (
        <div className="flex gap-2">
          {[
            { label: "Yes", v: true },
            { label: "No", v: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`rounded-full border px-6 py-2 text-sm font-medium transition ${
                current === opt.v
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    case "file": {
      const current = (value as string) ?? "";
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-dashed border-line-strong bg-paper px-4 py-6 text-center">
            <p className="mx-auto text-sm text-ink-faint">
              {current ? current : "File upload isn't available in this prototype"}
            </p>
          </div>
          {!current && (
            <button
              type="button"
              onClick={() => onChange("mock-upload.pdf (simulated)")}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-line-strong hover:text-ink"
            >
              Simulate upload
            </button>
          )}
        </div>
      );
    }

    case "ranking": {
      const current = Array.isArray(value) && value.length > 0 ? (value as string[]) : (question.options ?? []);

      function move(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= current.length) return;
        reorder(index, target);
      }

      function reorder(from: number, to: number) {
        if (from === to) return;
        const next = [...current];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        onChange(next);
      }

      return <RankingInput items={current} onReorder={reorder} onMove={move} />;
    }

    default:
      return null;
  }
}

interface RankingInputProps {
  items: string[];
  onReorder: (from: number, to: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}

function RankingInput({ items, onReorder, onMove }: RankingInputProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDrop(dropIndex: number) {
    if (dragIndex !== null && dragIndex !== dropIndex) onReorder(dragIndex, dropIndex);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <ol className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={item}
          draggable
          onDragStart={(e) => {
            setDragIndex(i);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (dragIndex !== null && dragIndex !== i) setOverIndex(i);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(i);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={`flex items-center gap-2 rounded-lg border bg-surface px-4 py-2.5 text-sm text-ink transition ${
            dragIndex === i
              ? "border-line-strong opacity-40"
              : overIndex === i
                ? "border-ink"
                : "border-line"
          }`}
        >
          <span className="shrink-0 cursor-grab text-ink-faint active:cursor-grabbing" aria-hidden="true">
            <GripVertical className="h-4 w-4" />
          </span>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper font-mono text-[0.6875rem] text-ink-faint">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1 truncate">{item}</span>
          <button
            type="button"
            onClick={() => onMove(i, -1)}
            disabled={i === 0}
            className="shrink-0 rounded-full p-1 text-ink-faint transition hover:text-ink disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(i, 1)}
            disabled={i === items.length - 1}
            className="shrink-0 rounded-full p-1 text-ink-faint transition hover:text-ink disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ol>
  );
}
