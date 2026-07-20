import { Question, Questionnaire } from "./types";

// Bump this whenever the seed content below changes — it's the only thing
// that invalidates stale localStorage on a returning browser (see
// lib/questionnaireStore.tsx). Without it, a browser that already hydrated
// once keeps whatever was in storage forever, silently masking any future
// edit to this file.
export const QUESTIONNAIRE_SEED_VERSION = 2;

const STRUCTURED_DISCOVERY_QUESTIONS: Question[] = [
  // Business & Context
  {
    id: "sd_why_now",
    section: "Business & Context",
    label: "Why are you undertaking this project now?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_problem_to_solve",
    section: "Business & Context",
    label: "What business problem are you hoping this project will solve?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_primary_job",
    section: "Business & Context",
    label: "What is the primary job this website should perform for your business?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_six_months_success",
    section: "Business & Context",
    label: "If this project is successful, what will be different six months from now?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Users
  {
    id: "sd_primary_users",
    section: "Users",
    label: "Who is this website primarily for?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_user_goals",
    section: "Users",
    label: "What are these users trying to accomplish, and what frustrations or obstacles do they currently experience?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_user_concerns",
    section: "Users",
    label: "What questions, concerns, or objections do visitors typically have before taking action?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_user_knowledge",
    section: "Users",
    label: "What level of knowledge do your typical visitors have before they arrive?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Current Experience
  {
    id: "sd_working_well",
    section: "Current Experience",
    label: "What aspects of the current website should be preserved?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_not_working",
    section: "Current Experience",
    label: "What isn't working today, and if you could fix just one thing, what would it be?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_misunderstanding",
    section: "Current Experience",
    label: "What do visitors currently fail to understand about your business after visiting the website?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_friction",
    section: "Current Experience",
    label: "Where do you believe users experience the most friction?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_analytics",
    section: "Current Experience",
    label: "Which analytics or user behaviour platforms are currently implemented, and which can you provide access to for analysis?",
    field_type: "multi_select",
    is_repeatable: false,
    options: [
      "Google Analytics (GA4)",
      "Google Search Console",
      "Microsoft Clarity",
      "Google Tag Manager",
      "Hotjar",
      "Mixpanel",
      "Amplitude",
      "Adobe Analytics",
      "HubSpot Analytics",
      "Meta Pixel",
      "LinkedIn Insight Tag",
      "Other",
      "None"
    ],
  },
  // Positioning & Content (renamed from Goals)
  {
    id: "sd_differentiators",
    section: "Positioning & Content",
    label: "What are the key strengths or differentiators that should be clearly communicated through the website?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_conversion",
    section: "Positioning & Content",
    label: "What information or experience usually convinces a visitor to become a customer?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_key_info",
    section: "Positioning & Content",
    label: "What information is most important for visitors to understand before taking action?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_first_impressions",
    section: "Positioning & Content",
    label: "What are the first three impressions a visitor should have within the first minute of visiting the website?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Success & Constraints (new section)
  {
    id: "sd_measure_success",
    section: "Success & Constraints",
    label: "How will you measure whether this project has been successful?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_constraints",
    section: "Success & Constraints",
    label: "Are there any business, technical, legal, or project constraints we should design around?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_unsuccessful_if",
    section: "Success & Constraints",
    label: "Is there anything that would make you consider this project unsuccessful, even if everything else went well?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Inspiration (new section)
  {
    id: "sd_inspiration",
    section: "Inspiration",
    label: "Which websites or digital experiences do you admire, and what specifically do you like about them?",
    field_type: "long_text",
    is_repeatable: false,
  },
];

const WORKSHOP_DISCOVERY_QUESTIONS: Question[] = [
  // Understanding the Business
  {
    id: "wd_business_story",
    section: "Understanding the Business",
    label: "Tell us the story of your business.",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_most_proud",
    section: "Understanding the Business",
    label: "What are you most proud of today?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_one_thing_remembered",
    section: "Understanding the Business",
    label: "If someone only remembered one thing about your company, what should it be?",
    field_type: "short_text",
    is_repeatable: false,
  },
  // Understanding the Opportunity
  {
    id: "wd_why_now",
    section: "Understanding the Opportunity",
    label: "Why is now the right time to invest in this project?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_if_not_happen",
    section: "Understanding the Opportunity",
    label: "If this project didn't happen, what would that mean for the business?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_biggest_opportunity",
    section: "Understanding the Opportunity",
    label: "Where do you think the biggest opportunity lies?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Understanding Your Customers
  {
    id: "wd_ideal_customer",
    section: "Understanding Your Customers",
    label: "Tell us about your ideal customer.",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_customer_journey",
    section: "Understanding Your Customers",
    label: "Walk us through their journey from discovering you to becoming a customer.",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_customer_frustration",
    section: "Understanding Your Customers",
    label: "Where do they get frustrated?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_customer_surprise",
    section: "Understanding Your Customers",
    label: "What surprises them?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Understanding Success
  {
    id: "wd_year_from_now",
    section: "Understanding Success",
    label: "Imagine we're meeting a year from now and this project has exceeded expectations. What has changed?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_worth_investment",
    section: "Understanding Success",
    label: "What would make you feel this project was absolutely worth the investment?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Understanding the Experience
  {
    id: "wd_personality",
    section: "Understanding the Experience",
    label: "If your website/product were a person, how would you describe its personality?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_emotions",
    section: "Understanding the Experience",
    label: "What emotions should people leave with?",
    field_type: "short_text",
    is_repeatable: true,
    placeholder: "One emotion per entry",
  },
  {
    id: "wd_impressive_experiences",
    section: "Understanding the Experience",
    label: "What experiences have impressed you recently, even outside your industry?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Priorities
  {
    id: "wd_one_problem",
    section: "Priorities",
    label: "If we could only solve one problem, which one should it be?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_most_effort",
    section: "Priorities",
    label: "Where should we spend the most effort?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_avoid_time",
    section: "Priorities",
    label: "Where should we avoid spending unnecessary time?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Risks
  {
    id: "wd_worries",
    section: "Risks",
    label: "What worries you most about this project?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_past_failures",
    section: "Risks",
    label: "What has gone wrong on previous projects?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "wd_would_fail",
    section: "Risks",
    label: "What would make this project fail?",
    field_type: "long_text",
    is_repeatable: false,
  },
];

export const SEED_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "long-form",
    name: "Structured Discovery",
    description: "A comprehensive discovery questionnaire covering context, users, goals, and constraints.",
    questions: STRUCTURED_DISCOVERY_QUESTIONS,
    created_at: "2026-01-01T00:00:00.000Z",
    last_updated: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "short-form",
    name: "Workshop Discovery",
    description: "A conversational discovery questionnaire for live workshop sessions.",
    questions: WORKSHOP_DISCOVERY_QUESTIONS,
    created_at: "2026-01-01T00:00:00.000Z",
    last_updated: "2026-01-01T00:00:00.000Z",
  },
];
