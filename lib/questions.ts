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
