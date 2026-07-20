"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useClientStore } from "@/lib/clientStore";
import { useQuestionnaireStore } from "@/lib/questionnaireStore";
import { ClientCard } from "@/components/ClientCard";
import { NewClientDialog } from "@/components/NewClientDialog";
import { getClientStatus, STATUS_LABELS } from "@/lib/status";
import { ClientStatus, Questionnaire } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const STATUS_FILTERS: (ClientStatus | "all")[] = ["all", "not_started", "in_progress", "complete"];

// A client should never disappear from the list just because its
// questionnaire couldn't be resolved (e.g. stale/corrupted storage) — fall
// back to an empty questionnaire so it still renders instead of vanishing.
const EMPTY_QUESTIONNAIRE: Questionnaire = {
  id: "unknown",
  name: "Unknown questionnaire",
  questions: [],
  created_at: "",
  last_updated: "",
};

export default function LandingPage() {
  const { clients, isHydrated, createClient } = useClientStore();
  const { questionnaires, getQuestionnaire, isHydrated: questionnairesHydrated } = useQuestionnaireStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((client) => {
      const questionnaire = getQuestionnaire(client.questionnaire_id) ?? EMPTY_QUESTIONNAIRE;
      const status = getClientStatus(client, questionnaire);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [client.name, client.channel_name ?? "", questionnaire.name].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [clients, query, statusFilter, getQuestionnaire]);

  function handleCreateClient(questionnaireId: string, name: string) {
    const client = createClient(questionnaireId, name);
    setShowNewClientDialog(false);
    router.push(`/client/${client.id}`);
  }

  const ready = isHydrated && questionnairesHydrated;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Client Intake</p>
        <h1 className="text-2xl font-semibold text-ink">Clients</h1>
        <p className="text-sm text-ink-muted">
          {ready ? `${clients.length} client${clients.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full max-w-xs rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
          />
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s}
                variant="pill"
                size="sm"
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowNewClientDialog(true)} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Client
        </Button>
      </div>

      <div className="mt-6">
        {!ready ? (
          <div className="rounded-lg border border-dashed border-line py-24 text-center text-sm text-ink-faint">
            Loading clients…
          </div>
        ) : clients.length === 0 ? (
          <EmptyState onNewClient={() => setShowNewClientDialog(true)} />
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-24 text-center">
            <p className="text-sm font-medium text-ink">No clients match your filters</p>
            <p className="mt-1 text-sm text-ink-muted">Try a different search term or status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client) => {
              const questionnaire = getQuestionnaire(client.questionnaire_id) ?? EMPTY_QUESTIONNAIRE;
              return <ClientCard key={client.id} client={client} questionnaire={questionnaire} />;
            })}
          </div>
        )}
      </div>

      {showNewClientDialog && (
        <NewClientDialog
          questionnaires={questionnaires}
          onCancel={() => setShowNewClientDialog(false)}
          onCreate={handleCreateClient}
        />
      )}
    </div>
  );
}

function EmptyState({ onNewClient }: { onNewClient: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface py-24 text-center">
      <p className="text-base font-medium text-ink">No clients yet</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
        Add your first client to start a guided intake — you&apos;ll drop straight into the question flow.
      </p>
      <Button variant="primary" onClick={onNewClient} className="mt-5">
        <Plus className="h-4 w-4" aria-hidden="true" />
        New Client
      </Button>
    </div>
  );
}
