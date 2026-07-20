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
import { operationalMetrics, type OperationalEvent } from "@/server/operations/metrics";
import {
  analysisRequestGuard,
  type RequestGuard,
  type RequestGuardLease,
} from "@/server/operations/request-guard";

export const RETENTION_HEADER = "X-BurgerMapper-Retention";
export const REQUEST_ID_HEADER = "X-BurgerMapper-Request-Id";

export interface AnalyzeRequestOptions {
  runtimeConfiguration?: AnalysisRuntimeConfiguration;
  mockDelayMs?: number;
  now?: () => Date;
  createRequestId?: () => string;
  openAiTransport?: OpenAIResponsesTransport;
  requestGuard?: RequestGuard;
}

export async function handleAnalyzeCaseRequest(
  request: Request,
  options: AnalyzeRequestOptions = {},
): Promise<Response> {
  const requestId =
    options.createRequestId?.() ?? globalThis.crypto.randomUUID();
  const receivedAt = (options.now?.() ?? new Date()).toISOString();
  const startedAt = Date.now();
  const decision = (options.requestGuard ?? analysisRequestGuard).acquire(request, startedAt);
  if (!decision.ok) {
    const code = decision.failure === "concurrency-limit"
      ? "CONCURRENCY_LIMIT_REACHED"
      : "RATE_LIMIT_EXCEEDED";
    operationalMetrics.record({ endpoint: "analysis", outcome: "rate-limited", durationMs: 0 });
    const response: AnalyzeCaseErrorResponse = {
      error: { code, message: SAFE_ERROR_MESSAGES[code], requestId },
    };
    return Response.json(response, {
      status: 429,
      headers: responseHeaders(requestId, undefined, decision.retryAfterSeconds),
    });
  }
  const lease = decision.lease;

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
    if (!configuration.openAiApiKeyConfigured || !configuration.openAiApiKey?.trim()) {
      throw new CaseRequestError("API_NOT_CONFIGURED", 503);
    }
    if (formData.get(CASE_FORM_FIELDS.consentToOpenAI) !== "true") {
      throw new CaseRequestError("CONSENT_REQUIRED", 403);
    }
    const providerResult = await runConfiguredAnalysis(
      normalizedInput,
      configuration,
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
    operationalMetrics.record({
      endpoint: "analysis",
      outcome: "success",
      durationMs: Date.now() - startedAt,
      processingMode: providerResult.processingMode,
      inputTokens: providerResult.operationalUsage?.inputTokens,
      outputTokens: providerResult.operationalUsage?.outputTokens,
      retryCount: providerResult.operationalUsage?.retryCount,
      estimatedCostUsd: providerResult.operationalUsage?.estimatedCostUsd,
    });
    return Response.json(response, {
      status: 200,
      headers: responseHeaders(requestId, lease),
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
    recordAnalysisEvent("failure", startedAt);
    return Response.json(response, {
      status: requestError.status,
      headers: responseHeaders(requestId, lease),
    });
  } finally {
    lease?.release();
  }
}

function responseHeaders(requestId: string, lease?: RequestGuardLease, retryAfterSeconds?: number): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    [RETENTION_HEADER]: "discarded-after-processing",
    [REQUEST_ID_HEADER]: requestId,
    ...(lease ? {
      "X-RateLimit-Limit": String(lease.limit),
      "X-RateLimit-Remaining": String(lease.remaining),
      "X-RateLimit-Reset": String(Math.ceil(lease.resetAt / 1_000)),
    } : {}),
    ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
  };
}

function recordAnalysisEvent(
  outcome: OperationalEvent["outcome"],
  startedAt: number,
): void {
  operationalMetrics.record({
    endpoint: "analysis",
    outcome,
    durationMs: Date.now() - startedAt,
  });
}
