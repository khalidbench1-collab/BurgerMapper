import {
  ANALYZE_CASE_ENDPOINT,
  CASE_FORM_FIELDS,
  SAFE_ERROR_MESSAGES,
  isCaseAnalysisErrorCode,
  type AnalyzeCaseErrorResponse,
  type AnalyzeCaseSuccessResponse,
  type CaseAnalysisErrorCode,
} from "@/domain/analysis-api";
import type {
  CaseAnalysis,
  CaseInput,
  DocumentAnalysisService,
} from "@/domain/case";

export class AnalysisApiError extends Error {
  constructor(
    public readonly code: CaseAnalysisErrorCode,
    public readonly requestId: string | null,
  ) {
    super(SAFE_ERROR_MESSAGES[code]);
    this.name = "AnalysisApiError";
  }
}

export class ServerDocumentAnalysisService implements DocumentAnalysisService {
  async analyzeDocument(
    input: CaseInput,
    signal?: AbortSignal,
  ): Promise<CaseAnalysis> {
    const response = await fetch(ANALYZE_CASE_ENDPOINT, {
      method: "POST",
      body: serializeCaseInput(input),
      signal,
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw parseApiError(payload);
    if (!isSuccessResponse(payload)) {
      throw new AnalysisApiError("INTERNAL_ERROR", null);
    }
    return payload.analysis;
  }
}

export function serializeCaseInput(input: CaseInput): FormData {
  const formData = new FormData();
  formData.set(CASE_FORM_FIELDS.kind, input.kind);
  formData.set(CASE_FORM_FIELDS.outputLanguage, input.outputLanguage);
  if (input.goal) {
    formData.set(CASE_FORM_FIELDS.goal, input.goal);
  }
  if (input.category) {
    formData.set(CASE_FORM_FIELDS.category, input.category);
  }

  if (input.kind === "goal") {
    // Goal-only requests have no evidence field.
  } else if (input.kind === "text") {
    formData.set(CASE_FORM_FIELDS.text, input.text);
  } else if (input.kind === "sample") {
    formData.set(CASE_FORM_FIELDS.sampleId, input.sampleId);
  } else {
    const file = input.document.file;
    if (!file) throw new AnalysisApiError("FILE_REQUIRED", null);
    formData.set(CASE_FORM_FIELDS.file, file, file.name);
  }
  return formData;
}

function parseApiError(payload: unknown): AnalysisApiError {
  const candidate = payload as Partial<AnalyzeCaseErrorResponse> | null;
  const code = candidate?.error?.code;
  const requestId = candidate?.error?.requestId;
  return new AnalysisApiError(
    isCaseAnalysisErrorCode(code) ? code : "INTERNAL_ERROR",
    typeof requestId === "string" ? requestId : null,
  );
}

function isSuccessResponse(
  payload: unknown,
): payload is AnalyzeCaseSuccessResponse {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Partial<AnalyzeCaseSuccessResponse>;
  return Boolean(
    candidate.analysis &&
      candidate.metadata &&
      candidate.metadata.retentionStatus === "discarded-after-processing",
  );
}
