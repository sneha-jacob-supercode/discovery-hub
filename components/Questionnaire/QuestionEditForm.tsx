"use client";

import { useState } from "react";
import { FieldType, Question } from "@/lib/types";
import { FIELD_TYPES } from "@/lib/fieldTypes";
import { Button } from "@/components/ui/Button";
import { SectionField } from "@/components/SectionField";
import { OptionsEditor } from "./OptionsEditor";

export interface QuestionFormPayload {
  label: string;
  section: string;
  field_type: FieldType;
  is_repeatable: boolean;
  options?: string[];
}

interface QuestionEditFormProps {
  sections: string[];
  initial?: Question;
  onCancel: () => void;
  onSubmit: (payload: QuestionFormPayload) => void;
}

export function QuestionEditForm({ sections, initial, onCancel, onSubmit }: QuestionEditFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [section, setSection] = useState<string>(initial?.section ?? sections[0] ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(initial?.field_type ?? "long_text");
  const [isRepeatable, setIsRepeatable] = useState(initial?.is_repeatable ?? false);
  const [options, setOptions] = useState<string[]>(initial?.options ?? []);

  const needsOptions = fieldType === "single_select" || fieldType === "multi_select" || fieldType === "ranking";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !section.trim()) return;
    onSubmit({
      label: label.trim(),
      section: section.trim(),
      field_type: fieldType,
      is_repeatable: isRepeatable,
      options: needsOptions ? options.filter((o) => o.trim().length > 0) : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.stopPropagation();
      }}
      className="space-y-3 rounded-md border border-line bg-surface p-3"
    >
      <div>
        <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Question</label>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. What's their budget range?"
          className="w-full rounded-md border border-line px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Section</label>
          <SectionField sections={sections} value={section} onChange={setSection} />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Type</label>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as FieldType)}
            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-ink-muted">
        <input
          type="checkbox"
          checked={isRepeatable}
          onChange={(e) => setIsRepeatable(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-line text-ink focus:ring-line"
        />
        Repeatable (allow multiple entries)
      </label>

      {needsOptions && (
        <div>
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">
            {fieldType === "ranking" ? "Items to rank" : "Answer choices"}
          </label>
          <OptionsEditor options={options} onChange={setOptions} />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <Button type="submit" variant="primary" size="sm" disabled={!label.trim() || !section.trim()}>
          {initial ? "Save" : "Add"}
        </Button>
      </div>
    </form>
  );
}
