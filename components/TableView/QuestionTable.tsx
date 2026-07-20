"use client";

import { Fragment } from "react";
import { Client, AnswerValue, Questionnaire } from "@/lib/types";
import { questionsBySection } from "@/lib/questions";
import { allQuestionsForClient } from "@/lib/status";
import { TableRow } from "./TableRow";

interface QuestionTableProps {
  client: Client;
  questionnaire: Questionnaire;
  onSave: (questionId: string, value: AnswerValue) => void;
  onAddEntry: (questionId: string, value: AnswerValue) => void;
  onRemoveEntry: (questionId: string, index: number) => void;
  onJumpToGuided: (questionId: string) => void;
  onHideQuestion: (questionId: string) => void;
}

export function QuestionTable({
  client,
  questionnaire,
  onSave,
  onAddEntry,
  onRemoveEntry,
  onJumpToGuided,
  onHideQuestion,
}: QuestionTableProps) {
  const grouped = questionsBySection(allQuestionsForClient(client, questionnaire));

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[45rem] border-collapse">
        <thead>
          <tr className="border-b border-line bg-paper text-left">
            <th className="px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-wide text-ink-faint">Question</th>
            <th className="px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-wide text-ink-faint">Answer</th>
            <th className="px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-wide text-ink-faint">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(({ section, questions }) => (
            <Fragment key={section}>
              <tr>
                <td colSpan={4} className="border-b border-line bg-paper/70 px-3 py-1.5">
                  <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-widest text-ink-faint">
                    {section}
                  </span>
                </td>
              </tr>
              {questions.map((q) => (
                <TableRow
                  key={q.id}
                  question={q}
                  answer={client.answers[q.id]}
                  onSave={(value) => onSave(q.id, value)}
                  onAddEntry={(value) => onAddEntry(q.id, value)}
                  onRemoveEntry={(index) => onRemoveEntry(q.id, index)}
                  onJumpToGuided={() => onJumpToGuided(q.id)}
                  onHide={() => onHideQuestion(q.id)}
                />
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
