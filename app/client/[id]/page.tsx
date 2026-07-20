"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useClientStore } from "@/lib/clientStore";
import { GuidedEntryView } from "@/components/GuidedEntry/GuidedEntryView";
import { TableView } from "@/components/TableView/TableView";

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}

function ClientDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { getClient, isHydrated } = useClientStore();

  const clientId = params.id;
  const client = getClient(clientId);
  const view = searchParams.get("view") === "table" ? "table" : "guided";
  const questionParam = searchParams.get("question") ?? undefined;

  if (!isHydrated) {
    return <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>;
  }

  if (!client) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-ink">Client not found</p>
        <Link href="/" className="text-sm font-medium text-ink underline">
          ← Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="relative flex flex-col gap-3 border-b border-line bg-surface px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0 sm:flex-1">
          <Link href="/" className="shrink-0 text-sm text-ink-faint hover:text-ink">
            ← Clients
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 min-w-0 max-w-[40%] text-center">
            <h1 className="truncate text-sm font-semibold text-ink">{client.name}</h1>
          </div>
        </div>

        <nav className="flex shrink-0 gap-1 rounded-full border border-line bg-paper p-0.5">
          <Link
            href={`/client/${clientId}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              view === "guided" ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            Guided Entry
          </Link>
          <Link
            href={`/client/${clientId}?view=table`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              view === "table" ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            Table View
          </Link>
        </nav>
      </header>

      {view === "table" ? (
        <TableView clientId={clientId} />
      ) : (
        <GuidedEntryView key={questionParam ?? "resume"} clientId={clientId} initialQuestionId={questionParam} />
      )}
    </div>
  );
}
