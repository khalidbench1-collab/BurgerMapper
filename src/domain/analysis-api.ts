import type { CaseAnalysis, InputKind } from "@/domain/case";
import type { CaseProfile } from "@/domain/case-profile";

export const ANALYZE_CASE_ENDPOINT = "/api/cases/analyze";

export const CASE_FORM_FIELDS = {
  kind: "kind",
  category: "category",
  outputLanguage: "outputLanguage",
  goal: "goal",
  text: "text",
  sampleId: "sampleId",
  file: "file",
  consentToOpenAI: "consentToOpenAI",
  clarificationResolution: "clarificationResolution",
} as const;

export const CASE_ANALYSIS_ERROR_CODES = [
  "INVALID_REQUEST",
  "UNSUPPORTED_INPUT_KIND",
  "TEXT_TOO_SHORT",
  "TEXT_TOO_LONG",
  "FILE_REQUIRED",
  "FILE_EMPTY",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_FILE_TYPE",
  "FILE_SIGNATURE_MISMATCH",
  "UNKNOWN_SAMPLE",
  "INVALID_CATEGORY",
  "INVALID_LANGUAGE",
  "GOAL_REQUIRED",
  "GOAL_TOO_SHORT",
  "GOAL_TOO_LONG",
  "MOCK_PROVIDER_ERROR",
  "API_NOT_CONFIGURED",
  "CONSENT_REQUIRED",
  "PROVIDER_TIMEOUT",
  "PROVIDER_RATE_LIMITED",
  "PROVIDER_AUTH_ERROR",
  "PROVIDER_BILLING_ERROR",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_RESPONSE_INVALID",
  "REQUEST_LIMIT_REACHED",
  "RATE_LIMIT_EXCEEDED",
  "CONCURRENCY_LIMIT_REACHED",
  "INTERNAL_ERROR",
] as const;

export type CaseAnalysisErrorCode =
  (typeof CASE_ANALYSIS_ERROR_CODES)[number];

export type ProcessingMode = "mock" | "openai";
export type RetentionStatus = "discarded-after-processing";

export interface AnalysisRequestMetadata {
  requestId: string;
  processingMode: ProcessingMode;
  inputKind: InputKind;
  receivedAt: string;
  retentionStatus: RetentionStatus;
}

export interface AnalyzeCaseSuccessResponse {
  analysis: CaseAnalysis;
  profile?: CaseProfile;
  metadata: AnalysisRequestMetadata;
}

export interface AnalyzeCaseErrorResponse {
  error: {
    code: CaseAnalysisErrorCode;
    message: string;
    requestId: string;
  };
}

export const SAFE_ERROR_MESSAGES: Record<CaseAnalysisErrorCode, string> = {
  INVALID_REQUEST: "The analysis request is incomplete or malformed.",
  UNSUPPORTED_INPUT_KIND: "Choose pasted text, a document, or the sample.",
  TEXT_TOO_SHORT: "Add at least 20 non-whitespace characters.",
  TEXT_TOO_LONG: "Keep pasted text to 20,000 characters or fewer.",
  FILE_REQUIRED: "Choose a PDF or image document.",
  FILE_EMPTY: "The selected file is empty.",
  FILE_TOO_LARGE: "The selected file is larger than 10 MB.",
  UNSUPPORTED_FILE_TYPE: "Choose a PDF, PNG, JPEG, or WebP document.",
  FILE_SIGNATURE_MISMATCH:
    "The file contents do not match the selected document type.",
  UNKNOWN_SAMPLE: "Choose the built-in fictional sample.",
  INVALID_CATEGORY: "Choose a supported category or clear the selection.",
  INVALID_LANGUAGE: "Choose English, German, or Arabic.",
  GOAL_REQUIRED: "Describe what you need to get done.",
  GOAL_TOO_SHORT: "Add at least 10 non-whitespace characters to your goal.",
  GOAL_TOO_LONG: "Keep your goal to 1,000 characters or fewer.",
  MOCK_PROVIDER_ERROR: "The mock route could not be created. Try again.",
  API_NOT_CONFIGURED:
    "Real analysis is not configured. Enable mock mode to continue.",
  CONSENT_REQUIRED:
    "Confirm consent before sending this case to OpenAI for analysis.",
  PROVIDER_TIMEOUT:
    "The analysis took too long. Try again with a smaller document.",
  PROVIDER_RATE_LIMITED:
    "The analysis service is temporarily busy. Wait a moment and try again.",
  PROVIDER_AUTH_ERROR:
    "Real analysis is not available because the server configuration was rejected.",
  PROVIDER_BILLING_ERROR:
    "Real analysis is unavailable because the API project cannot currently process paid requests.",
  PROVIDER_UNAVAILABLE:
    "The analysis service is temporarily unavailable. You can retry or use mock mode.",
  PROVIDER_RESPONSE_INVALID:
    "The analysis response could not be validated safely. Try again.",
  REQUEST_LIMIT_REACHED:
    "This case reached its analysis request limit. Start a new case to continue.",
  RATE_LIMIT_EXCEEDED:
    "Too many analysis requests were sent. Wait a moment and try again.",
  CONCURRENCY_LIMIT_REACHED:
    "An analysis is already running for this client. Wait for it to finish.",
  INTERNAL_ERROR: "The request could not be completed. Try again.",
};

export function isCaseAnalysisErrorCode(
  value: unknown,
): value is CaseAnalysisErrorCode {
  return CASE_ANALYSIS_ERROR_CODES.includes(value as CaseAnalysisErrorCode);
}
