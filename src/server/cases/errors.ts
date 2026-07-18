import {
  SAFE_ERROR_MESSAGES,
  type CaseAnalysisErrorCode,
} from "@/domain/analysis-api";

export class CaseRequestError extends Error {
  constructor(
    public readonly code: CaseAnalysisErrorCode,
    public readonly status: number,
  ) {
    super(SAFE_ERROR_MESSAGES[code]);
    this.name = "CaseRequestError";
  }
}
