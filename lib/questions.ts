import { Question } from "./types";

// Groups questions by their `.section`, preserving the order sections first
// appear in — each questionnaire defines its own sections now (see
// lib/questionnaireSeed.ts), so there's no fixed global section list to sort
// against.
export function questionsBySection(questions: Question[]): { section: string; questions: Question[] }[] {
  const grouped = new Map<string, Question[]>();
  for (const q of questions) {
    const list = grouped.get(q.section) ?? [];
    list.push(q);
    grouped.set(q.section, list);
  }
  return Array.from(grouped.entries()).map(([section, sectionQuestions]) => ({
    section,
    questions: sectionQuestions,
  }));
}

// Swaps a question with its adjacent sibling within the same section,
// preserving section boundaries. No-op past the edges of the section.
export function reorderWithinSection(
  questions: Question[],
  questionId: string,
  direction: -1 | 1
): Question[] {
  const groups = questionsBySection(questions);
  const group = groups.find((g) => g.questions.some((q) => q.id === questionId));
  if (!group) return questions;
  const index = group.questions.findIndex((q) => q.id === questionId);
  const target = index + direction;
  if (target < 0 || target >= group.questions.length) return questions;
  const next = [...group.questions];
  [next[index], next[target]] = [next[target], next[index]];
  group.questions = next;
  return groups.flatMap((g) => g.questions);
}

// Swaps a whole section (and all its questions) with the adjacent section.
// No-op past the first/last section.
export function reorderSections(
  questions: Question[],
  section: string,
  direction: -1 | 1
): Question[] {
  const groups = questionsBySection(questions);
  const index = groups.findIndex((g) => g.section === section);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= groups.length) return questions;
  const next = [...groups];
  [next[index], next[target]] = [next[target], next[index]];
  return next.flatMap((g) => g.questions);
}
