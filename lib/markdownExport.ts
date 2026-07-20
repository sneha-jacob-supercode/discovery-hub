import { Client, Questionnaire } from "./types";
import { allQuestionsForClient, answerPreview } from "./status";
import { questionsBySection } from "./questions";

export function buildClientMarkdown(client: Client, questionnaire: Questionnaire): string {
  const groups = questionsBySection(allQuestionsForClient(client, questionnaire));
  const lines: string[] = [`# ${client.name}`, ""];
  for (const group of groups) {
    lines.push(`## ${group.section}`, "");
    for (const q of group.questions) {
      const answer = client.answers[q.id];
      const preview = answer?.status === "answered" ? answerPreview(answer) : "";
      const text = preview || (answer?.status === "skipped" ? "_Skipped_" : "_Not answered_");
      lines.push(`**${q.label}**`, text, "");
    }
  }
  return lines.join("\n").trim();
}
