import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseResearchSummary,
  RouteClaim,
  SourceReference,
  SupportedLanguage,
} from "@/domain/case";
import type { ProfileSufficiencyState } from "@/domain/case-profile";

export const RESEARCH_CASE_ENDPOINT = "/api/cases/research";

export const RESEARCH_TOPICS = [
  "residence-permit-renewal",
  "address-registration",
  "freelance-tax-registration",
  "unsupported",
] as const;

export type ResearchTopic = (typeof RESEARCH_TOPICS)[number];

export interface ResearchCaseRequest {
  topic: ResearchTopic;
  category: BureaucracyCategory | null;
  outputLanguage: SupportedLanguage;
  profileSufficiency: ProfileSufficiencyState;
}

export interface StepEvidence {
  stepOrder: number;
  claimIds: string[];
  sourceIds: string[];
}

export interface ResearchCaseResult {
  sources: SourceReference[];
  claims: RouteClaim[];
  stepEvidence: StepEvidence[];
  summary: CaseResearchSummary;
}

export interface ResearchResponseMetadata {
  requestId: string;
  receivedAt: string;
  retentionStatus: "discarded-after-processing";
  inputScope: "abstract-route-topic-only";
}

export interface ResearchCaseSuccessResponse {
  research: ResearchCaseResult;
  metadata: ResearchResponseMetadata;
}

export const RESEARCH_ERROR_CODES = [
  "INVALID_REQUEST",
  "PROFILE_NOT_SUFFICIENT",
  "INVALID_TOPIC",
  "INVALID_CATEGORY",
  "INVALID_LANGUAGE",
  "RESEARCH_UNAVAILABLE",
  "RATE_LIMIT_EXCEEDED",
  "CONCURRENCY_LIMIT_REACHED",
  "INTERNAL_ERROR",
] as const;

export type ResearchErrorCode = (typeof RESEARCH_ERROR_CODES)[number];

export interface ResearchCaseErrorResponse {
  error: { code: ResearchErrorCode; message: string; requestId: string };
}

export const SAFE_RESEARCH_ERROR_MESSAGES: Record<ResearchErrorCode, string> = {
  INVALID_REQUEST: "The official-source request is incomplete or malformed.",
  PROFILE_NOT_SUFFICIENT: "Answer the route-changing question before official-source research begins.",
  INVALID_TOPIC: "This route topic is not supported for official-source research yet.",
  INVALID_CATEGORY: "Choose a supported category or clear the selection.",
  INVALID_LANGUAGE: "Choose English, German, or Arabic.",
  RESEARCH_UNAVAILABLE: "Official-source research is temporarily unavailable. Verify the route with the responsible authority.",
  RATE_LIMIT_EXCEEDED: "Too many source-research requests were sent. Wait a moment and try again.",
  CONCURRENCY_LIMIT_REACHED: "Source research is already running for this client. Wait for it to finish.",
  INTERNAL_ERROR: "Official-source research could not be completed safely.",
};

export function isResearchErrorCode(value: unknown): value is ResearchErrorCode {
  return RESEARCH_ERROR_CODES.includes(value as ResearchErrorCode);
}
