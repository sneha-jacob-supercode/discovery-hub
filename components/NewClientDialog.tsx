"use client";

import { useState } from "react";
import { Questionnaire } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface NewClientDialogProps {
  questionnaires: Questionnaire[];
  onCancel: () => void;
  onCreate: (questionnaireId: string, name: string) => void;
}

export function NewClientDialog({ questionnaires, onCancel, onCreate }: NewClientDialogProps) {
  const [name, setName] = useState("");
  const [questionnaireId, setQuestionnaireId] = useState(questionnaires[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionnaireId) return;
    onCreate(questionnaireId, name);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-lg border border-line bg-surface p-5 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-ink">New client</h2>

        <div className="mt-4">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Client name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Inc."
            className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Questionnaire</label>
          <div className="space-y-1.5">
            {questionnaires.map((q) => (
              <label
                key={q.id}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition ${
                  questionnaireId === q.id ? "border-ink" : "border-line hover:border-line-strong"
                }`}
              >
                <span className="flex items-center gap-2 text-ink">
                  <input
                    type="radio"
                    name="questionnaire"
                    checked={questionnaireId === q.id}
                    onChange={() => setQuestionnaireId(q.id)}
                    className="h-3.5 w-3.5 text-ink focus:ring-line"
                  />
                  {q.name}
                </span>
                <span className="font-mono text-[0.6875rem] text-ink-faint">
                  {q.questions.length} question{q.questions.length === 1 ? "" : "s"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" size="sm" disabled={!questionnaireId}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
