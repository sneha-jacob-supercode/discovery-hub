"use client";

import { useState } from "react";

const NEW_SECTION_OPTION = "__new_section__";

interface SectionFieldProps {
  sections: string[];
  value: string;
  onChange: (value: string) => void;
}

// A <select> of existing sections plus an explicit "+ Add new section…"
// option that switches to a plain text input. An <input list> + <datalist>
// combo was tried first, but Chrome renders a dropdown arrow on it that
// makes it look like a closed picklist — users didn't realize they could
// type past the suggestion, so section creation felt broken. This makes
// "pick existing" vs "create new" two unambiguous, separate modes.
export function SectionField({ sections, value, onChange }: SectionFieldProps) {
  const [addingSection, setAddingSection] = useState(sections.length === 0 || !sections.includes(value));

  if (addingSection) {
    return (
      <div className="space-y-1">
        <input
          autoFocus={sections.length > 0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Timeline"
          className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
        {sections.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setAddingSection(false);
              onChange(sections[0]);
            }}
            className="text-[11px] text-ink-faint underline transition hover:text-ink"
          >
            Choose an existing section instead
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === NEW_SECTION_OPTION) {
          setAddingSection(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
    >
      {sections.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
      <option value={NEW_SECTION_OPTION}>+ Add new section…</option>
    </select>
  );
}
