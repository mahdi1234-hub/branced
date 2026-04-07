export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  condition?: StepCondition;
  calculations?: Calculation[];
}

export interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "range" | "number" | "email";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean;
  visibleWhen?: FieldCondition;
  validation?: FieldValidation;
}

export interface StepCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "gt" | "lt" | "in";
  value: string | number | string[];
}

export interface FieldCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "gt" | "lt";
  value: string | number;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message?: string;
}

export interface Calculation {
  id: string;
  formula: string; // e.g., "{field1} * {field2} + 10"
  resultField: string;
  label: string;
}

export interface FormData {
  [key: string]: string | number | boolean | string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AnalysisResult {
  domain: string;
  title: string;
  steps_completed: number;
  key_findings: string[];
  scores: Record<string, number>;
  recommendations: string[];
  risk_level: "low" | "medium" | "high";
  confidence: number;
  breakdown: { label: string; value: number }[];
}

export interface FlipbookPage {
  id: string;
  type: "cover" | "onboarding" | "form" | "chat" | "analysis" | "results" | "end";
  title?: string;
  content?: React.ReactNode;
}

export type AppPhase = "landing" | "onboarding" | "guidance" | "results";
