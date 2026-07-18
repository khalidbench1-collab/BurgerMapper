import type { CaseAnalysis, InputKind } from "@/domain/case";

export const ANALYZE_CASE_ENDPOINT = "/api/cases/analyze";

export const CASE_FORM_FIELDS = {
  kind: "kind",
  category: "category",
  outputLanguage: "outputLanguage",
  text: "text",
  sampleId: "sampleId",
  file: "file",
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
  "MOCK_PROVIDER_ERROR",
  "API_NOT_CONFIGURED",
  "INTERNAL_ERROR",
] as const;

export type CaseAnalysisErrorCode =
  (typeof CASE_ANALYSIS_ERROR_CODES)[number];

export type ProcessingMode = "mock";
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
  MOCK_PROVIDER_ERROR: "The mock route could not be created. Try again.",
  API_NOT_CONFIGURED:
    "Real analysis is not configured. Enable mock mode to continue.",
  INTERNAL_ERROR: "The request could not be completed. Try again.",
};

export function isCaseAnalysisErrorCode(
  value: unknown,
): value is CaseAnalysisErrorCode {
  return CASE_ANALYSIS_ERROR_CODES.includes(value as CaseAnalysisErrorCode);
}
