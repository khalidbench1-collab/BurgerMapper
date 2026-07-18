import {
  type AnalyzeCaseErrorResponse,
  type AnalyzeCaseSuccessResponse,
  SAFE_ERROR_MESSAGES,
} from "@/domain/analysis-api";
import { CaseRequestError } from "@/server/cases/errors";
import {
  readAnalysisRuntimeConfiguration,
  runConfiguredAnalysis,
  type AnalysisRuntimeConfiguration,
} from "@/server/cases/provider";
import type { OpenAIResponsesTransport } from "@/server/cases/openai/provider";
import { CASE_FORM_FIELDS } from "@/domain/analysis-api";
import { normalizeAnalyzeCaseFormData } from "@/server/cases/validate-request";

export const RETENTION_HEADER = "X-BurgerMapper-Retention";
export const REQUEST_ID_HEADER = "X-BurgerMapper-Request-Id";

export interface AnalyzeRequestOptions {
  runtimeConfiguration?: AnalysisRuntimeConfiguration;
  mockDelayMs?: number;
  now?: () => Date;
  createRequestId?: () => string;
  openAiTransport?: OpenAIResponsesTransport;
}

export async function handleAnalyzeCaseRequest(
  request: Request,
  options: AnalyzeRequestOptions = {},
): Promise<Response> {
  const requestId =
    options.createRequestId?.() ?? globalThis.crypto.randomUUID();
  const receivedAt = (options.now?.() ?? new Date()).toISOString();

  try {
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
      throw new CaseRequestError("INVALID_REQUEST", 400);
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw new CaseRequestError("INVALID_REQUEST", 400);
    }

    const normalizedInput = await normalizeAnalyzeCaseFormData(
      formData,
      receivedAt,
    );
    const configuration =
      options.runtimeConfiguration ?? readAnalysisRuntimeConfiguration();
    if (!configuration.mockEnabled && (!configuration.openAiApiKeyConfigured || !configuration.openAiApiKey?.trim())) {
      throw new CaseRequestError("API_NOT_CONFIGURED", 503);
    }
    if (!configuration.mockEnabled && formData.get(CASE_FORM_FIELDS.consentToOpenAI) !== "true") {
      throw new CaseRequestError("CONSENT_REQUIRED", 403);
    }
    const providerResult = await runConfiguredAnalysis(
      normalizedInput,
      configuration,
      options.mockDelayMs,
      { transport: options.openAiTransport, signal: request.signal },
    );

    const response: AnalyzeCaseSuccessResponse = {
      analysis: providerResult.analysis,
      ...(providerResult.profile ? { profile: providerResult.profile } : {}),
      metadata: {
        requestId,
        processingMode: providerResult.processingMode,
        inputKind: normalizedInput.kind,
        receivedAt,
        retentionStatus: "discarded-after-processing",
      },
    };
    return Response.json(response, {
      status: 200,
      headers: responseHeaders(requestId),
    });
  } catch (error) {
    const requestError =
      error instanceof CaseRequestError
        ? error
        : new CaseRequestError("INTERNAL_ERROR", 500);
    const response: AnalyzeCaseErrorResponse = {
      error: {
        code: requestError.code,
        message: SAFE_ERROR_MESSAGES[requestError.code],
        requestId,
      },
    };
    return Response.json(response, {
      status: requestError.status,
      headers: responseHeaders(requestId),
    });
  }
}

function responseHeaders(requestId: string): HeadersInit {
  return {
    "Cache-Control": "no-store",
    [RETENTION_HEADER]: "discarded-after-processing",
    [REQUEST_ID_HEADER]: requestId,
  };
}
