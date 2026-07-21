"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePortalClientData } from "@/lib/clientPortal";
import { GuidedEntryView } from "@/components/GuidedEntry/GuidedEntryView";
import { Button } from "@/components/ui/Button";

export default function ClientPortalPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { client, questionnaire, clientName, status, verify, actions } = usePortalClientData(slug);
  const [started, setStarted] = useState(false);

  if (status === "checking") {
    return <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>;
  }

  if (status === "needs_verification") {
    return <VerifyScreen clientName={clientName} onVerify={verify} />;
  }

  if (!client || !questionnaire) {
    return <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>;
  }

  if (!started) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-ink">{client.name} Discovery Questionnaire</h1>
        <Button variant="primary" onClick={() => setStarted(true)} className="mt-6">
          Start Now
        </Button>
      </div>
    );
  }

  return (
    <GuidedEntryView client={client} questionnaire={questionnaire} mode="public" actions={actions} />
  );
}

function VerifyScreen({
  clientName,
  onVerify,
}: {
  clientName: string | null;
  onVerify: (email: string, password: string) => Promise<boolean>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("checking");
    const ok = await onVerify(email, password);
    if (!ok) setStatus("error");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6">
      <div className="w-full rounded-lg border border-line bg-surface px-6 py-8">
        <h1 className="text-lg font-semibold text-ink">
          Access {clientName ? `${clientName}'s` : "this"} questionnaire
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter the email and password you were sent for this project.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoFocus
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
          {status === "error" && (
            <p className="text-sm text-danger">
              We couldn&apos;t verify those details for this project. Please check them or contact your
              Supercode representative.
            </p>
          )}
          <Button
            variant="primary"
            type="submit"
            disabled={status === "checking" || !email.trim() || !password.trim()}
          >
            {status === "checking" ? "Checking…" : "Continue"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-faint">
          Unable to login? Please email us at{" "}
          <a href="mailto:contact@supercode.in" className="font-medium text-ink-muted hover:text-ink">
            contact@supercode.in
          </a>
        </p>
      </div>
    </div>
  );
}
