"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";

interface OptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [draft, setDraft] = useState("");

  function addOption() {
    const value = draft.trim();
    if (!value) return;
    onChange([...options, value]);
    setDraft("");
  }

  function updateOption(index: number, value: string) {
    onChange(options.map((o, i) => (i === index ? value : o)));
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="flex-1 rounded-md border border-line px-2 py-1 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
          <button
            type="button"
            onClick={() => move(i, -1)}
            disabled={i === 0}
            className="rounded-full p-1 text-ink-faint hover:text-ink disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(i, 1)}
            disabled={i === options.length - 1}
            className="rounded-full p-1 text-ink-faint hover:text-ink disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => removeOption(i)}
            className="rounded-full p-1 text-ink-faint hover:text-warning"
            aria-label="Remove option"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOption();
            }
          }}
          placeholder="Add a choice…"
          className="flex-1 rounded-md border border-line px-2 py-1 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
        <button
          type="button"
          onClick={addOption}
          className="rounded-full p-1 text-ink-faint hover:text-ink"
          aria-label="Add choice"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
