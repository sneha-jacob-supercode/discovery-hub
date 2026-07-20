"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Questionnaire } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { generateClientPassword } from "@/lib/generatePassword";

interface NewClientDialogProps {
  questionnaires: Questionnaire[];
  onCancel: () => void;
  onCreate: (questionnaireId: string, name: string, contactEmails: string[], password: string) => void;
}

function parseEmails(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function NewClientDialog({ questionnaires, onCancel, onCreate }: NewClientDialogProps) {
  const [name, setName] = useState("");
  const [questionnaireId, setQuestionnaireId] = useState(questionnaires[0]?.id ?? "");
  const [contactEmailsInput, setContactEmailsInput] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  function handleEmailsChange(value: string) {
    setContactEmailsInput(value);
    if (!password && value.trim()) {
      setPassword(generateClientPassword());
    }
  }

  function handleCopyBoth() {
    const emails = parseEmails(contactEmailsInput);
    const text = `Email: ${emails.join(", ")}\nPassword: ${password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionnaireId) return;
    const contactEmails = parseEmails(contactEmailsInput);
    const finalPassword = password || generateClientPassword();
    onCreate(questionnaireId, name, contactEmails, finalPassword);
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
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">
            Contact email(s)
          </label>
          <textarea
            value={contactEmailsInput}
            onChange={(e) => handleEmailsChange(e.target.value)}
            placeholder="client@company.com, another@company.com"
            rows={2}
            className="w-full resize-none rounded-md border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
          <p className="mt-1 text-[0.6875rem] text-ink-faint">
            Comma or newline separated. These emails, plus the password below, are required to open the
            client link.
          </p>
        </div>

        {password && (
          <div className="mt-4">
            <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">
              Generated password
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={password}
                className="w-full rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm text-ink"
              />
              <button
                type="button"
                onClick={handleCopyBoth}
                aria-label="Copy email and password"
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-2.5 py-2 text-xs font-medium text-ink-muted transition hover:border-line-strong hover:text-ink"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    Copy both
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-[0.6875rem] text-ink-faint">
              Share this with the client directly — it won&apos;t be shown again after you create this
              client.
            </p>
          </div>
        )}

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
