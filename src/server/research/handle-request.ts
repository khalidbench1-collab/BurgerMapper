import type { BureaucracyCategory } from "@/domain/categories";
import { isBureaucracyCategory } from "@/domain/categories";
import type { SupportedLanguage } from "@/domain/case";
import {
  RESEARCH_TOPICS,
  SAFE_RESEARCH_ERROR_MESSAGES,
  type ResearchCaseErrorResponse,
  type ResearchCaseRequest,
  type ResearchCaseSuccessResponse,
  type ResearchErrorCode,
} from "@/domain/research-api";
import { researchOfficialSources, ResearchServiceError, type OfficialSourceRetriever } from "@/server/research/service";
import { operationalMetrics } from "@/server/operations/metrics";
import { researchRequestGuard, type RequestGuard, type RequestGuardLease } from "@/server/operations/request-guard";

const MAX_RESEARCH_REQUEST_BYTES = 4096;
const ALLOWED_KEYS = new Set(["topic", "category", "outputLanguage", "profileSufficiency"]);

export async function handleResearchCaseRequest(
  request: Request,
  options: { retriever?: OfficialSourceRetriever; now?: () => Date; createRequestId?: () => string; requestGuard?: RequestGuard } = {},
): Promise<Response> {
  const requestId = options.createRequestId?.() ?? globalThis.crypto.randomUUID();
  const receivedAt = (options.now?.() ?? new Date()).toISOString();
  const startedAt = Date.now();
  const decision = (options.requestGuard ?? researchRequestGuard).acquire(request, startedAt);
  if (!decision.ok) {
    const code: ResearchErrorCode = decision.failure === "concurrency-limit" ? "CONCURRENCY_LIMIT_REACHED" : "RATE_LIMIT_EXCEEDED";
    operationalMetrics.record({ endpoint: "research", outcome: "rate-limited", durationMs: 0 });
    return Response.json(
      { error: { code, message: SAFE_RESEARCH_ERROR_MESSAGES[code], requestId } } satisfies ResearchCaseErrorResponse,
      { status: 429, headers: headers(requestId, undefined, decision.retryAfterSeconds) },
    );
  }
  const lease = decision.lease;
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new RequestValidationError("INVALID_REQUEST", 400);
    const raw = await request.text();
    if (!raw || new TextEncoder().encode(raw).byteLength > MAX_RESEARCH_REQUEST_BYTES) throw new RequestValidationError("INVALID_REQUEST", 400);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { throw new RequestValidationError("INVALID_REQUEST", 400); }
    const input = validateResearchRequest(parsed);
    const research = await researchOfficialSources(input, options.retriever, options.now);
    const response: ResearchCaseSuccessResponse = {
      research,
      metadata: { requestId, receivedAt, retentionStatus: "discarded-after-processing", inputScope: "abstract-route-topic-only" },
    };
    operationalMetrics.record({ endpoint: "research", outcome: "success", durationMs: Date.now() - startedAt, processingMode: "curated" });
    return Response.json(response, { status: 200, headers: headers(requestId, lease) });
  } catch (error) {
    const normalized = error instanceof RequestValidationError || error instanceof ResearchServiceError
      ? error
      : new RequestValidationError("INTERNAL_ERROR", 500);
    const code = normalized.code as ResearchErrorCode;
    const response: ResearchCaseErrorResponse = { error: { code, message: SAFE_RESEARCH_ERROR_MESSAGES[code], requestId } };
    operationalMetrics.record({ endpoint: "research", outcome: "failure", durationMs: Date.now() - startedAt });
    return Response.json(response, { status: normalized.status, headers: headers(requestId, lease) });
  } finally {
    lease?.release();
  }
}

export function validateResearchRequest(value: unknown): ResearchCaseRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RequestValidationError("INVALID_REQUEST", 400);
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !ALLOWED_KEYS.has(key))) throw new RequestValidationError("INVALID_REQUEST", 400);
  if (!RESEARCH_TOPICS.includes(record.topic as ResearchCaseRequest["topic"])) throw new RequestValidationError("INVALID_TOPIC", 400);
  if (record.category !== null && (typeof record.category !== "string" || !isBureaucracyCategory(record.category))) throw new RequestValidationError("INVALID_CATEGORY", 400);
  if (!isLanguage(record.outputLanguage)) throw new RequestValidationError("INVALID_LANGUAGE", 400);
  if (record.profileSufficiency !== "sufficient" && record.profileSufficiency !== "needs-clarification") throw new RequestValidationError("INVALID_REQUEST", 400);
  return {
    topic: record.topic as ResearchCaseRequest["topic"],
    category: record.category as BureaucracyCategory | null,
    outputLanguage: record.outputLanguage,
    profileSufficiency: record.profileSufficiency,
  };
}

class RequestValidationError extends Error {
  constructor(public readonly code: ResearchErrorCode, public readonly status: number) { super(code); }
}

function isLanguage(value: unknown): value is SupportedLanguage { return value === "en" || value === "de" || value === "ar"; }
function headers(requestId: string, lease?: RequestGuardLease, retryAfterSeconds?: number): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-BurgerMapper-Retention": "discarded-after-processing",
    "X-BurgerMapper-Request-Id": requestId,
    ...(lease ? {
      "X-RateLimit-Limit": String(lease.limit),
      "X-RateLimit-Remaining": String(lease.remaining),
      "X-RateLimit-Reset": String(Math.ceil(lease.resetAt / 1_000)),
    } : {}),
    ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
  };
}
