"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuestionnaireStore } from "@/lib/questionnaireStore";
import { questionsBySection } from "@/lib/questions";
import { FIELD_TYPE_LABEL } from "@/lib/fieldTypes";
import { QuestionEditForm } from "@/components/Questionnaire/QuestionEditForm";
import { Button } from "@/components/ui/Button";

export default function QuestionnaireDetailPage() {
  const params = useParams<{ id: string }>();
  const { getQuestionnaire, isHydrated, addQuestion, updateQuestion, removeQuestion } = useQuestionnaireStore();
  const questionnaire = getQuestionnaire(params.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isHydrated) {
    return <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">Loading…</div>;
  }

  if (!questionnaire) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-ink">Questionnaire not found</p>
        <Link href="/questionnaires" className="text-sm font-medium text-ink underline">
          ← Back to questionnaires
        </Link>
      </div>
    );
  }

  const grouped = questionsBySection(questionnaire.questions);
  const sections = grouped.map((g) => g.section);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link href="/questionnaires" className="text-sm text-ink-faint hover:text-ink">
        ← Questionnaires
      </Link>

      <header className="mt-2">
        <h1 className="text-2xl font-semibold text-ink">{questionnaire.name}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {questionnaire.questions.length} question{questionnaire.questions.length === 1 ? "" : "s"}
          {questionnaire.description ? ` · ${questionnaire.description}` : ""}
        </p>
      </header>

      {questionnaire.questions.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line py-16 text-center text-sm text-ink-faint">
          No questions yet — add the first one below.
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-line bg-surface">
          {grouped.map(({ section, questions }) => (
            <div key={section}>
              <div className="border-b border-line bg-paper/70 px-5 py-1.5">
                <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-ink-faint">
                  {section}
                </span>
              </div>
              {questions.map((q) => (
                <div key={q.id} className="border-b border-line px-5 py-3 last:border-b-0">
                  {editingId === q.id ? (
                    <QuestionEditForm
                      sections={sections}
                      initial={q}
                      onCancel={() => setEditingId(null)}
                      onSubmit={(payload) => {
                        updateQuestion(questionnaire.id, q.id, payload);
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{q.label}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                          {FIELD_TYPE_LABEL[q.field_type]}
                          {q.is_repeatable ? " · repeatable" : ""}
                          {q.options && q.options.length > 0 ? ` · ${q.options.length} choices` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => setEditingId(q.id)}
                          className="rounded-full p-1.5 text-ink-faint transition hover:bg-paper hover:text-ink"
                          aria-label="Edit question"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeQuestion(questionnaire.id, q.id)}
                          className="rounded-full p-1.5 text-ink-faint transition hover:bg-paper hover:text-warning"
                          aria-label="Delete question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {showAddForm ? (
          <QuestionEditForm
            sections={sections}
            onCancel={() => setShowAddForm(false)}
            onSubmit={(payload) => {
              addQuestion(questionnaire.id, payload);
              setShowAddForm(false);
            }}
          />
        ) : (
          <Button variant="secondary" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Question
          </Button>
        )}
      </div>
    </div>
  );
}
