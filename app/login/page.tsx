"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

const ERROR_MESSAGES: Record<string, string> = {
  domain_not_allowed: "That email isn't part of the supercode team.",
  auth_failed: "That link didn't work — request a new one below.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(
    callbackError ? (ERROR_MESSAGES[callbackError] ?? "Something went wrong. Please try again.") : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed.toLowerCase().endsWith("@supercode.in")) {
      setError("Use your supercode email address.");
      return;
    }

    setStatus("sending");
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (signInError) {
      setStatus("error");
      setError("Couldn't send the link. Please try again.");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6">
      <div className="w-full rounded-lg border border-line bg-surface px-6 py-8">
        <h1 className="text-lg font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">supercode team members only.</p>

        {status === "sent" ? (
          <p className="mt-6 text-sm text-ink">
            Check your inbox — we sent a sign-in link to <span className="font-medium">{email.trim()}</span>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@supercode.in"
              autoFocus
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button variant="primary" type="submit" disabled={status === "sending" || !email.trim()}>
              {status === "sending" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
