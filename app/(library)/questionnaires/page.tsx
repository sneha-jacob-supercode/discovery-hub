"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useQuestionnaireStore } from "@/lib/questionnaireStore";
import { Button } from "@/components/ui/Button";
import { NewQuestionnaireDialog } from "@/components/NewQuestionnaireDialog";
import { QuestionnaireRow } from "@/components/QuestionnaireRow";

export default function QuestionnairesPage() {
  const { questionnaires, isHydrated, createQuestionnaire } = useQuestionnaireStore();
  const router = useRouter();
  const [showNewDialog, setShowNewDialog] = useState(false);

  async function handleCreate(name: string) {
    const questionnaire = await createQuestionnaire(name);
    setShowNewDialog(false);
    router.push(`/questionnaires/${questionnaire.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink">Questionnaires</h1>
        <p className="text-sm text-ink-muted">
          {isHydrated ? `${questionnaires.length} questionnaire${questionnaires.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
      </header>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Questionnaire
        </Button>
      </div>

      <div className="mt-6">
        {!isHydrated ? (
          <div className="rounded-lg border border-dashed border-line py-24 text-center text-sm text-ink-faint">
            Loading questionnaires…
          </div>
        ) : questionnaires.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong bg-surface py-24 text-center">
            <p className="text-base font-medium text-ink">No questionnaires yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
              Create a questionnaire to define the question set clients get assigned at intake.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line rounded-lg border border-line bg-surface">
            {questionnaires.map((q) => (
              <QuestionnaireRow key={q.id} questionnaire={q} />
            ))}
          </div>
        )}
      </div>

      {showNewDialog && (
        <NewQuestionnaireDialog onCancel={() => setShowNewDialog(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
