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
    id: "sd_six_months_success",
    section: "Business & Context",
    label: "If this project is successful, what will be different six months from now?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_top_priorities",
    section: "Business & Context",
    label: "What are your top three business priorities for this project?",
    field_type: "short_text",
    is_repeatable: true,
    placeholder: "One priority per entry",
  },
  // Users
  {
    id: "sd_primary_users",
    section: "Users",
    label: "Who is this product or website primarily for?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_user_goals",
    section: "Users",
    label: "What are these users trying to accomplish?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_user_frustrations",
    section: "Users",
    label: "What frustrations or obstacles do they currently experience?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_user_concerns",
    section: "Users",
    label: "What questions or concerns do users typically have before taking action?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Current Experience
  {
    id: "sd_working_well",
    section: "Current Experience",
    label: "What is working well today that should be preserved?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_not_working",
    section: "Current Experience",
    label: "What isn't working today?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_drop_off",
    section: "Current Experience",
    label: "Where do users typically get stuck or drop off?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_one_fix",
    section: "Current Experience",
    label: "If you could fix just one part of the current experience, what would it be?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Goals
  {
    id: "sd_key_action",
    section: "Goals",
    label: "What action do you most want users to take?",
    field_type: "short_text",
    is_repeatable: false,
  },
  {
    id: "sd_measure_success",
    section: "Goals",
    label: "How will you measure whether this project has been successful?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_brand_feeling",
    section: "Goals",
    label: "What should users think or feel after interacting with your brand?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Content & Messaging
  {
    id: "sd_key_info",
    section: "Content & Messaging",
    label: "What information is most important for users to understand?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_hard_to_find",
    section: "Content & Messaging",
    label: "What information do users struggle to find today?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Constraints
  {
    id: "sd_constraints",
    section: "Constraints",
    label: "Are there any business, technical, or legal constraints we should design around?",
    field_type: "long_text",
    is_repeatable: false,
  },
  {
    id: "sd_non_negotiables",
    section: "Constraints",
    label: "Are there any features or requirements that are non-negotiable?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Success
  {
    id: "sd_unsuccessful_if",
    section: "Success",
    label: "Is there anything that would make you consider this project unsuccessful, even if everything else went well?",
    field_type: "long_text",
    is_repeatable: false,
  },
  // Priorities
  {
    id: "sd_priority_ranking",
    section: "Priorities",
    label: "Rank these by importance",
    field_type: "ranking",
    is_repeatable: false,
    options: [
      "Visual identity",
      "Performance",
      "SEO",
      "AI discoverability",
      "Lead generation",
      "Ease of use",
      "Accessibility",
      "Scalability",
      "Content management",
      "Speed of launch",
    ],
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
