"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useClientStore } from "@/lib/clientStore";
import { GuidedEntryView } from "@/components/GuidedEntry/GuidedEntryView";

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}

function ClientDetailContent() {
  const params = useParams<{ id: string }>();
  const { getClient, isHydrated } = useClientStore();

  const clientId = params.id;
  const client = getClient(clientId);

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
      <header className="flex items-center gap-3 border-b border-line bg-surface px-6 py-3">
        <Link href="/" className="shrink-0 text-sm text-ink-faint hover:text-ink">
          ← Clients
        </Link>
        <div className="h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        <h1 className="truncate text-sm font-semibold text-ink">{client.name}</h1>
      </header>

      <GuidedEntryView clientId={clientId} />
    </div>
  );
}
