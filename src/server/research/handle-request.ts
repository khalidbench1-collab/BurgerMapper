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

const MAX_RESEARCH_REQUEST_BYTES = 4096;
const ALLOWED_KEYS = new Set(["topic", "category", "outputLanguage", "profileSufficiency"]);

export async function handleResearchCaseRequest(
  request: Request,
  options: { retriever?: OfficialSourceRetriever; now?: () => Date; createRequestId?: () => string } = {},
): Promise<Response> {
  const requestId = options.createRequestId?.() ?? globalThis.crypto.randomUUID();
  const receivedAt = (options.now?.() ?? new Date()).toISOString();
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
    return Response.json(response, { status: 200, headers: headers(requestId) });
  } catch (error) {
    const normalized = error instanceof RequestValidationError || error instanceof ResearchServiceError
      ? error
      : new RequestValidationError("INTERNAL_ERROR", 500);
    const code = normalized.code as ResearchErrorCode;
    const response: ResearchCaseErrorResponse = { error: { code, message: SAFE_RESEARCH_ERROR_MESSAGES[code], requestId } };
    return Response.json(response, { status: normalized.status, headers: headers(requestId) });
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
function headers(requestId: string): HeadersInit { return { "Cache-Control": "no-store", "X-BurgerMapper-Retention": "discarded-after-processing", "X-BurgerMapper-Request-Id": requestId }; }
