import { Answer, AnswerValue, Client, Question } from "./types";

function answered(value: AnswerValue): Answer {
  return { status: "answered", value };
}

function repeated(entries: AnswerValue[]): Answer {
  return { status: "answered", entries };
}

function skipped(): Answer {
  return { status: "skipped" };
}

const brightpathCustomQuestions: Question[] = [
  {
    id: "custom_referral_source",
    section: "Business Context",
    label: "How did they hear about us?",
    field_type: "short_text",
    is_repeatable: false,
    is_custom: true,
    placeholder: "e.g. referral, past client, inbound",
  },
];

export const SEED_CLIENTS: Client[] = [
  {
    id: "brightpath-labs",
    name: "Brightpath Labs",
    channel_name: "#brightpath-labs",
    meeting_date: "2026-07-10",
    created_at: "2026-07-08T15:00:00.000Z",
    last_updated: "2026-07-10T19:22:00.000Z",
    questionnaire_id: "long-form",
    custom_questions: brightpathCustomQuestions,
    hidden_question_ids: ["custom_referral_source"],
    answers: {
      company_name: answered("Brightpath Labs"),
      elevator_pitch: answered(
        "Brightpath helps mid-market logistics teams route freight in real time using live carrier data instead of static spreadsheets."
      ),
      industry: answered("SaaS"),
      primary_contact: answered("Dana Ruiz, Head of Product"),
      project_type: answered("New build"),
      integrations_needed: answered(["Stripe", "Slack", "Custom API"]),
      has_brand_guidelines: answered(true),
      competitors: repeated(["RouteWise", "Freightly", "CargoSync"]),
      differentiation: answered(
        "Real-time re-routing when a carrier falls through, competitors only do static planning."
      ),
      goals: repeated(["Cut manual dispatch time by half", "Launch self-serve tier by Q1"]),
      success_metrics: answered("Dispatch time per shipment, self-serve signups in first 90 days."),
      custom_referral_source: answered("Referred by a current client, Meridian Freight."),
      hosting_preference: skipped(),
      target_launch: skipped(),
      brand_assets: skipped(),
      existing_stack: skipped(),
      technical_constraints: skipped(),
    },
  },
  {
    id: "form-and-field",
    name: "Form & Field Studio",
    channel_name: "#form-and-field",
    meeting_date: "2026-07-15",
    created_at: "2026-07-14T13:10:00.000Z",
    last_updated: "2026-07-15T17:45:00.000Z",
    questionnaire_id: "short-form",
    custom_questions: [],
    hidden_question_ids: [],
    answers: {
      company_name: answered("Form & Field Studio"),
      elevator_pitch: answered("A direct-to-consumer furniture brand doing a full storefront redesign."),
      industry: answered("E-commerce"),
      primary_contact: answered("Owen Marsh, Founder"),
      project_type: answered("Redesign"),
    },
  },
  {
    id: "harbor-clinic-group",
    name: "Harbor Clinic Group",
    channel_name: "#harbor-clinic-group",
    meeting_date: "2026-06-28",
    created_at: "2026-06-20T12:00:00.000Z",
    last_updated: "2026-06-29T21:05:00.000Z",
    questionnaire_id: "long-form",
    custom_questions: [],
    hidden_question_ids: [],
    answers: {
      company_name: answered("Harbor Clinic Group"),
      elevator_pitch: answered(
        "A four-location outpatient clinic group migrating off a legacy scheduling system."
      ),
      industry: answered("Healthcare"),
      primary_contact: answered("Priya Nandan, Ops Director"),
      project_type: answered("Migration"),
      integrations_needed: answered(["Custom API"]),
      has_brand_guidelines: answered(false),
      brand_assets: answered("harbor-style-guide.pdf (mock upload)"),
      competitors: repeated(["Nearby Health Partners"]),
      differentiation: answered("Longer-tenured clinical staff and same-day scheduling."),
      goals: repeated(["Zero downtime migration", "Unify records across all 4 locations"]),
      success_metrics: answered("Patient wait time, no data loss during cutover."),
      target_launch: answered("Q3 2026"),
      existing_stack: answered(["Custom codebase"]),
      hosting_preference: answered("Client-managed"),
      technical_constraints: answered("Must stay HIPAA compliant throughout the migration window."),
    },
  },
  {
    id: "north-loop-goods",
    name: "North Loop Goods",
    channel_name: "#north-loop-goods",
    created_at: "2026-07-16T18:30:00.000Z",
    last_updated: "2026-07-16T18:30:00.000Z",
    questionnaire_id: "long-form",
    custom_questions: [],
    hidden_question_ids: [],
    answers: {},
  },
];
