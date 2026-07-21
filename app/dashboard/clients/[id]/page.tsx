"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { KeyRound, Link2, FileText } from "lucide-react";
import { useClientStore } from "@/lib/clientStore";
import { useQuestionnaireStore } from "@/lib/questionnaireStore";
import { Client, Questionnaire } from "@/lib/types";
import { buildClientMarkdown } from "@/lib/markdownExport";
import { GuidedEntryView } from "@/components/GuidedEntry/GuidedEntryView";
import { ManageAccessDialog } from "@/components/ManageAccessDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Favicon } from "@/components/ui/Favicon";

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}

function ClientDetailContent() {
  const params = useParams<{ id: string }>();
  const {
    getClient,
    isHydrated,
    saveAnswer,
    addEntry,
    removeEntry,
    skipQuestion,
    addCustomQuestion,
    hideQuestion,
    unhideQuestion,
    updateCustomQuestion,
    updateQuestionOverride,
    updateContactEmails,
    setClientPassword,
  } = useClientStore();
  const { getQuestionnaire, isHydrated: questionnairesHydrated } = useQuestionnaireStore();
  const [showManageAccess, setShowManageAccess] = useState(false);

  const clientId = params.id;
  const client = getClient(clientId);
  const questionnaire = client ? getQuestionnaire(client.questionnaire_id) : undefined;

  if (!isHydrated || !questionnairesHydrated) {
    return <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>;
  }

  if (!client || !questionnaire) {
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Favicon url={client.hub_favicon_url} />
          <h1 className="min-w-0 truncate text-sm font-semibold text-ink">{client.name}</h1>
          {!client.hub_client_id && (
            <Badge tone="neutral" size="sm" className="shrink-0">
              Not linked
            </Badge>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowManageAccess(true)} className="shrink-0">
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          Manage Access
        </Button>
        <ClientLinkActions client={client} questionnaire={questionnaire} />
      </header>

      {showManageAccess && (
        <ManageAccessDialog
          client={client}
          onCancel={() => setShowManageAccess(false)}
          onSave={async (contactEmails, newPassword) => {
            await updateContactEmails(clientId, contactEmails);
            if (newPassword) {
              try {
                await setClientPassword(clientId, newPassword);
              } catch {
                // updateContactEmails already succeeded; the password can be
                // regenerated again from this same dialog if this failed.
              }
            }
            setShowManageAccess(false);
          }}
        />
      )}

      <GuidedEntryView
        client={client}
        questionnaire={questionnaire}
        mode="internal"
        actions={{
          saveAnswer: (questionId, value) => saveAnswer(clientId, questionId, value),
          addEntry: (questionId, value) => addEntry(clientId, questionId, value),
          removeEntry: (questionId, index) => removeEntry(clientId, questionId, index),
          skipQuestion: (questionId) => skipQuestion(clientId, questionId),
          addCustomQuestion: (question) => addCustomQuestion(clientId, question),
          hideQuestion: (questionId) => hideQuestion(clientId, questionId),
          unhideQuestion: (questionId) => unhideQuestion(clientId, questionId),
          updateCustomQuestion: (questionId, patch) => updateCustomQuestion(clientId, questionId, patch),
          updateQuestionOverride: (questionId, patch) => updateQuestionOverride(clientId, questionId, patch),
        }}
      />
    </div>
  );
}

function ClientLinkActions({ client, questionnaire }: { client: Client; questionnaire: Questionnaire }) {
  const [copiedItem, setCopiedItem] = useState<"url" | "md" | null>(null);

  function copyUrl() {
    navigator.clipboard.writeText(`${window.location.origin}/client/${client.slug}`);
    setCopiedItem("url");
    setTimeout(() => setCopiedItem((v) => (v === "url" ? null : v)), 1200);
  }

  function copyMarkdown() {
    navigator.clipboard.writeText(buildClientMarkdown(client, questionnaire));
    setCopiedItem("md");
    setTimeout(() => setCopiedItem((v) => (v === "md" ? null : v)), 1200);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={copyUrl} className="shrink-0">
        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
        {copiedItem === "url" ? "Copied!" : "Copy client link"}
      </Button>
      <Button variant="secondary" size="sm" onClick={copyMarkdown} className="shrink-0">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        {copiedItem === "md" ? "Copied!" : "Copy as md"}
      </Button>
    </>
  );
}
