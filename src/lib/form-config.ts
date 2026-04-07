import { FormStep } from "./types";

export const onboardingSteps: FormStep[] = [
  {
    id: "welcome",
    title: "Welcome to BRANCED",
    description: "Let's understand your needs. What domain or subject would you like guidance in?",
    fields: [
      {
        id: "domain",
        type: "select",
        label: "Domain",
        required: true,
        placeholder: "Select your domain",
        options: [
          { label: "Business & Strategy", value: "business" },
          { label: "Technology & Engineering", value: "technology" },
          { label: "Health & Wellness", value: "health" },
          { label: "Finance & Investment", value: "finance" },
          { label: "Education & Learning", value: "education" },
          { label: "Creative & Design", value: "creative" },
          { label: "Science & Research", value: "science" },
          { label: "Other", value: "other" },
        ],
      },
      {
        id: "custom_domain",
        type: "text",
        label: "Specify your domain",
        placeholder: "Enter your specific domain",
        visibleWhen: { field: "domain", operator: "equals", value: "other" },
      },
      {
        id: "subject",
        type: "textarea",
        label: "Subject / Topic",
        placeholder: "Describe what you need guidance on...",
        required: true,
      },
    ],
  },
  {
    id: "experience",
    title: "Your Background",
    description: "Help us calibrate the guidance to your experience level.",
    fields: [
      {
        id: "experience_level",
        type: "radio",
        label: "Experience Level",
        required: true,
        options: [
          { label: "Beginner - Just starting out", value: "beginner" },
          { label: "Intermediate - Some experience", value: "intermediate" },
          { label: "Advanced - Significant experience", value: "advanced" },
          { label: "Expert - Deep expertise", value: "expert" },
        ],
      },
      {
        id: "years_experience",
        type: "range",
        label: "Years of Experience",
        min: 0,
        max: 30,
        step: 1,
        defaultValue: 0,
      },
      {
        id: "goals",
        type: "checkbox",
        label: "What are your goals?",
        options: [
          { label: "Learn something new", value: "learn" },
          { label: "Solve a specific problem", value: "solve" },
          { label: "Make a decision", value: "decide" },
          { label: "Create a plan", value: "plan" },
          { label: "Get expert advice", value: "advice" },
        ],
      },
    ],
  },
  {
    id: "specifics",
    title: "Specific Details",
    description: "The more context you provide, the better the guidance.",
    fields: [
      {
        id: "urgency",
        type: "select",
        label: "How urgent is this?",
        required: true,
        options: [
          { label: "Exploring / No rush", value: "low" },
          { label: "Need guidance soon", value: "medium" },
          { label: "Urgent - Need answers now", value: "high" },
          { label: "Critical - Time sensitive", value: "critical" },
        ],
      },
      {
        id: "budget_applicable",
        type: "radio",
        label: "Is there a budget involved?",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
          { label: "Not applicable", value: "na" },
        ],
      },
      {
        id: "budget_amount",
        type: "number",
        label: "Budget Amount ($)",
        placeholder: "Enter amount",
        visibleWhen: { field: "budget_applicable", operator: "equals", value: "yes" },
      },
      {
        id: "constraints",
        type: "textarea",
        label: "Any constraints or limitations?",
        placeholder: "Time, resources, technical, etc.",
      },
    ],
    calculations: [
      {
        id: "priority_score",
        formula: "urgency_score * experience_multiplier",
        resultField: "priority_score",
        label: "Priority Score",
      },
    ],
  },
  {
    id: "preferences",
    title: "Guidance Preferences",
    description: "How would you like to receive your guidance?",
    fields: [
      {
        id: "guidance_style",
        type: "radio",
        label: "Preferred guidance style",
        required: true,
        options: [
          { label: "Step-by-step walkthrough", value: "stepbystep" },
          { label: "High-level overview first", value: "overview" },
          { label: "Deep dive with details", value: "deepdive" },
          { label: "Quick actionable tips", value: "quick" },
        ],
      },
      {
        id: "detail_level",
        type: "range",
        label: "Detail Level",
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
      },
      {
        id: "additional_context",
        type: "textarea",
        label: "Anything else you'd like us to know?",
        placeholder: "Additional context, preferences, or specific questions...",
      },
    ],
  },
];

export function evaluateCondition(
  condition: { field: string; operator: string; value: string | number | string[] } | undefined,
  formData: Record<string, unknown>
): boolean {
  if (!condition) return true;
  const fieldValue = formData[condition.field];
  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;
    case "not_equals":
      return fieldValue !== condition.value;
    case "contains":
      return String(fieldValue).includes(String(condition.value));
    case "gt":
      return Number(fieldValue) > Number(condition.value);
    case "lt":
      return Number(fieldValue) < Number(condition.value);
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(String(fieldValue));
    default:
      return true;
  }
}

export function calculatePriorityScore(formData: Record<string, unknown>): number {
  const urgencyScores: Record<string, number> = {
    low: 1,
    medium: 3,
    high: 7,
    critical: 10,
  };
  const experienceMultipliers: Record<string, number> = {
    beginner: 1.5,
    intermediate: 1.2,
    advanced: 1.0,
    expert: 0.8,
  };
  const urgency = urgencyScores[String(formData.urgency)] || 1;
  const expMult = experienceMultipliers[String(formData.experience_level)] || 1;
  return Math.round(urgency * expMult * 10) / 10;
}
