export const DEFAULT_OPENAI_MODEL = "gpt-5.6-luna";
export const OPENAI_REQUEST_TIMEOUT_MS = 20_000;
export const OPENAI_MAX_OUTPUT_TOKENS = 6_000;
export const MAX_PROVIDER_REQUESTS_PER_CASE = 4;
export const MAX_CLARIFICATION_QUESTIONS = 3;

export type CaseReasoningTask = "intake" | "profile" | "document" | "route" | "high-risk";
export type VerifiedReasoningEffort = "low" | "medium" | "high" | "xhigh";

export const REASONING_BY_TASK: Record<CaseReasoningTask, VerifiedReasoningEffort> = {
  intake: "low",
  profile: "medium",
  document: "high",
  route: "high",
  "high-risk": "xhigh",
};
