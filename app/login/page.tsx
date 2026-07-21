"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const CODE_TTL_MS = 10 * 60 * 1000;

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "verifying">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemainingMs(Math.max(0, expiresAt - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  async function requestOtp(targetEmail: string) {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/internal-auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return false;
      }
      setExpiresAt(Date.now() + CODE_TTL_MS);
      setStatus("idle");
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
      return false;
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const ok = await requestOtp(trimmed);
    if (ok) {
      setOtp("");
      setStep("code");
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setError(null);
    try {
      const res = await fetch("/api/internal-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError("That code is invalid or has expired.");
        setStatus("idle");
        return;
      }
      window.location.href = next;
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  async function handleResend() {
    setNotice(null);
    const ok = await requestOtp(email.trim());
    if (ok) {
      setOtp("");
      setNotice("Code resent.");
    }
  }

  const codeExpired = expiresAt !== null && remainingMs <= 0;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6">
      <div className="w-full rounded-lg border border-line bg-surface px-6 py-8">
        <h1 className="text-lg font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">supercode team members only.</p>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="mt-6 flex flex-col gap-3">
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
              {status === "sending" ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="mt-6 flex flex-col gap-3">
            <p className="text-sm text-ink">
              We sent a code to <span className="font-medium">{email.trim()}</span> on Slack.
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              autoFocus
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm tracking-widest text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
            />
            <p className="text-xs text-ink-faint">
              {codeExpired ? "Code expired — request a new one." : `Expires in ${formatCountdown(remainingMs)}`}
            </p>
            {error && <p className="text-sm text-danger">{error}</p>}
            {notice && <p className="text-sm text-ink-muted">{notice}</p>}
            <Button
              variant="primary"
              type="submit"
              disabled={status === "verifying" || !otp.trim() || codeExpired}
            >
              {status === "verifying" ? "Verifying…" : "Verify code"}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={handleResend}
              disabled={status === "sending"}
            >
              {status === "sending" ? "Resending…" : "Resend code"}
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
