"use client";

import { useRouter } from "next/navigation";
import { useClientStore } from "@/lib/clientStore";
import { useQuestionnaireStore } from "@/lib/questionnaireStore";
import { getProgress } from "@/lib/status";
import { QuestionTable } from "./QuestionTable";

export function TableView({ clientId }: { clientId: string }) {
  const { getClient, saveAnswer, addEntry, removeEntry, hideQuestion } = useClientStore();
  const { getQuestionnaire } = useQuestionnaireStore();
  const router = useRouter();
  const client = getClient(clientId);
  const questionnaire = client ? getQuestionnaire(client.questionnaire_id) : undefined;

  if (!client || !questionnaire) {
    return <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>;
  }

  const progress = getProgress(client, questionnaire);

  return (
    <div className="mx-auto w-full max-w-5xl min-h-0 flex-1 overflow-y-auto px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {progress.answered} of {progress.total} answered
          {progress.skipped > 0 && <span className="text-warning"> · {progress.skipped} skipped</span>}
        </p>
        {progress.reached === 0 && (
          <p className="text-xs text-ink-faint">Nothing captured yet — click any answer cell to fill one in.</p>
        )}
      </div>

      <QuestionTable
        client={client}
        questionnaire={questionnaire}
        onSave={(questionId, value) => saveAnswer(clientId, questionId, value)}
        onAddEntry={(questionId, value) => addEntry(clientId, questionId, value)}
        onRemoveEntry={(questionId, index) => removeEntry(clientId, questionId, index)}
        onJumpToGuided={(questionId) => router.push(`/client/${clientId}?question=${questionId}`)}
        onHideQuestion={(questionId) => hideQuestion(clientId, questionId)}
      />
    </div>
  );
}
