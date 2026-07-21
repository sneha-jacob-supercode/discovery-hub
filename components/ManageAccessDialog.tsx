"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RefreshCw, X } from "lucide-react";
import { Client } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { generateClientPassword } from "@/lib/generatePassword";
import { useClientStore } from "@/lib/clientStore";

interface ManageAccessDialogProps {
  client: Client;
  onCancel: () => void;
  onSave: (contactEmails: string[], newPassword?: string) => Promise<void>;
}

function parseEmails(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function ManageAccessDialog({ client, onCancel, onSave }: ManageAccessDialogProps) {
  const { getClientPassword } = useClientStore();
  const [contactEmailsInput, setContactEmailsInput] = useState(client.contact_emails.join("\n"));
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getClientPassword(client.id).then((password) => {
      if (!cancelled) setCurrentPassword(password);
    });
    return () => {
      cancelled = true;
    };
  }, [client.id, getClientPassword]);

  const copyablePassword = newPassword ?? currentPassword;

  function handleCopyBoth() {
    if (!copyablePassword) return;
    const emails = parseEmails(contactEmailsInput);
    const text = `Email: ${emails.join(", ")}\nPassword: ${copyablePassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const contactEmails = parseEmails(contactEmailsInput);
    setIsSubmitting(true);
    try {
      await onSave(contactEmails, newPassword ?? undefined);
      setCurrentPassword(copyablePassword);
      setNewPassword(null);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Manage access</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close"
            className="text-ink-faint transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">
            Contact email(s)
          </label>
          <textarea
            autoFocus
            value={contactEmailsInput}
            onChange={(e) => setContactEmailsInput(e.target.value)}
            placeholder="client@company.com, another@company.com"
            rows={4}
            disabled={isSubmitting}
            className="w-full resize-none rounded-md border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line disabled:cursor-not-allowed disabled:opacity-60"
          />
          <p className="mt-1 text-[0.6875rem] text-ink-faint">
            Comma or newline separated. These emails, plus the password, are required to open the client
            link.
          </p>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-[0.6875rem] font-medium text-ink-muted">Password</label>
          <input
            readOnly
            value={newPassword ?? "••••••••"}
            className={`mb-2 w-full rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm ${
              newPassword ? "text-ink" : "text-ink-faint"
            }`}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNewPassword(generateClientPassword())}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Regenerate password
            </button>
            <button
              type="button"
              onClick={handleCopyBoth}
              disabled={!copyablePassword || isSubmitting}
              aria-label="Copy email and password"
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
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
            {newPassword
              ? "Share this with the client directly — it won't be shown again after you save."
              : "Regenerating replaces the client's current password immediately on save."}
          </p>
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
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : justSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
