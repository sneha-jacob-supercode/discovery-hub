"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface EditQuestionnaireDialogProps {
  initialName: string;
  onCancel: () => void;
  onSave: (name: string) => Promise<void>;
}

export function EditQuestionnaireDialog({ initialName, onCancel, onSave }: EditQuestionnaireDialogProps) {
  const [name, setName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={isSubmitting ? undefined : onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-lg border border-line bg-surface p-5 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-ink">Rename questionnaire</h2>

        <div className="mt-4">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Questionnaire name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Enterprise Discovery"
            className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim() || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
