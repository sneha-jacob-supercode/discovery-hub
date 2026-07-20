"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NewQuestionnaireDialogProps {
  onCancel: () => void;
  onCreate: (name: string) => void;
}

export function NewQuestionnaireDialog({ onCancel, onCreate }: NewQuestionnaireDialogProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-lg border border-line bg-surface p-5 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-ink">New questionnaire</h2>

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
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
