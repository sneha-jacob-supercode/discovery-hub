import { Answer, AnswerValue, Client, ClientStatus, Question, Questionnaire } from "./types";
import { questionsBySection } from "./questions";

export function allQuestionsForClient(client: Client, questionnaire: Questionnaire): Question[] {
  const hidden = new Set(client.hidden_question_ids);
  return [...questionnaire.questions, ...client.custom_questions].filter((q) => !hidden.has(q.id));
}

export function hiddenQuestionsForClient(client: Client, questionnaire: Questionnaire): Question[] {
  if (client.hidden_question_ids.length === 0) return [];
  const byId = new Map([...questionnaire.questions, ...client.custom_questions].map((q) => [q.id, q]));
  return client.hidden_question_ids
    .map((id) => byId.get(id))
    .filter((q): q is Question => Boolean(q));
}

// Flow order: grouped by section (so a custom question slots in with its
// section instead of trailing after every global question).
export function orderedQuestionsForClient(client: Client, questionnaire: Questionnaire): Question[] {
  return questionsBySection(allQuestionsForClient(client, questionnaire)).flatMap((g) => g.questions);
}

export interface ProgressInfo {
  total: number;
  answered: number;
  skipped: number;
  reached: number;
}

export function getProgress(client: Client, questionnaire: Questionnaire): ProgressInfo {
  const questions = allQuestionsForClient(client, questionnaire);
  let answered = 0;
  let skipped = 0;
  for (const q of questions) {
    const a = client.answers[q.id];
    if (!a) continue;
    if (a.status === "answered") answered += 1;
    else if (a.status === "skipped") skipped += 1;
  }
  return { total: questions.length, answered, skipped, reached: answered + skipped };
}

export function getClientStatus(client: Client, questionnaire: Questionnaire): ClientStatus {
  const { total, answered, reached } = getProgress(client, questionnaire);
  if (answered === 0) return "not_started";
  if (reached >= total) return "complete";
  if (answered === total) return "complete";
  return "in_progress";
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
};

export const STATUS_TONE: Record<ClientStatus, "neutral" | "success" | "warning"> = {
  not_started: "neutral",
  in_progress: "warning",
  complete: "success",
};

// Returns the first unanswered-or-skipped question, for "resume" navigation.
export function firstOpenQuestion(client: Client, questionnaire: Questionnaire): Question | undefined {
  const questions = allQuestionsForClient(client, questionnaire);
  return (
    questions.find((q) => !client.answers[q.id] || client.answers[q.id]?.status !== "answered") ??
    questions[0]
  );
}

function formatValue(value: AnswerValue | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

// Short, single-line preview of an answer for side panel rows and cards.
export function answerPreview(answer: Answer | undefined): string {
  if (!answer) return "";
  if (answer.status === "skipped") return "";
  if (answer.entries && answer.entries.length > 0) {
    return answer.entries.map(formatValue).filter(Boolean).join(" · ");
  }
  return formatValue(answer.value);
}

// Convenience lookup used by landing-page card previews — reads straight
// from answers so there is one source of truth (no duplicated client fields).
export function answerFor(client: Client, questionId: string): string {
  return answerPreview(client.answers[questionId]);
}
