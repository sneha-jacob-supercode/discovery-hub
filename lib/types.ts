export type FieldType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "boolean"
  | "file"
  | "ranking";

export interface Question {
  id: string;
  section: string;
  label: string;
  field_type: FieldType;
  is_repeatable: boolean;
  options?: string[];
  placeholder?: string;
  is_custom?: boolean;
}

export type AnswerStatus = "answered" | "skipped" | "n/a";

export type AnswerValue = string | string[] | boolean;

export interface Answer {
  status: AnswerStatus;
  value?: AnswerValue;
  entries?: AnswerValue[];
}

export interface Client {
  id: string;
  slug: string;
  name: string;
  channel_name?: string;
  meeting_date?: string;
  contact_emails: string[];
  created_at: string;
  last_updated: string;
  answers: Record<string, Answer>;
  custom_questions: Question[];
  hidden_question_ids: string[];
  question_overrides: Record<string, Pick<Question, "label" | "section" | "field_type" | "is_repeatable" | "options">>;
  questionnaire_id: string;
  hub_client_id?: string | null;
  hub_slack_channel_id?: string | null;
  hub_favicon_url?: string | null;
}

export interface HubClient {
  id: string;
  name: string;
  slack_channel_id: string | null;
  slack_channel_name: string;
  slug: string;
  favicon_url: string | null;
}

export type ClientStatus = "not_started" | "in_progress" | "complete";

export interface Questionnaire {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  created_at: string;
  last_updated: string;
}
