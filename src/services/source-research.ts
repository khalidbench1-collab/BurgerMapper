import type { BureaucracyCategory } from "@/domain/categories";
import type { CaseAnalysis, CaseResearchSummary } from "@/domain/case";
import {
  RESEARCH_CASE_ENDPOINT,
  SAFE_RESEARCH_ERROR_MESSAGES,
  isResearchErrorCode,
  type ResearchCaseErrorResponse,
  type ResearchCaseRequest,
  type ResearchCaseResult,
  type ResearchCaseSuccessResponse,
  type ResearchErrorCode,
  type ResearchTopic,
} from "@/domain/research-api";
import type { CaseProfile } from "@/domain/case-profile";

export class ResearchApiError extends Error {
  constructor(public readonly code: ResearchErrorCode, public readonly requestId: string | null) {
    super(SAFE_RESEARCH_ERROR_MESSAGES[code]);
    this.name = "ResearchApiError";
  }
}

export class ServerSourceResearchService {
  async research(profile: CaseProfile, analysis: CaseAnalysis, signal?: AbortSignal): Promise<ResearchCaseResult> {
    const request: ResearchCaseRequest = {
      topic: inferResearchTopic(profile.category, analysis),
      category: profile.category,
      outputLanguage: profile.outputLanguage,
      profileSufficiency: profile.sufficiency.state,
    };
    const response = await fetch(RESEARCH_CASE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw parseError(payload);
    if (!isSuccess(payload)) throw new ResearchApiError("INTERNAL_ERROR", null);
    return payload.research;
  }
}

export function inferResearchTopic(category: BureaucracyCategory | null, analysis: CaseAnalysis): ResearchTopic {
  if (category === "arrival-registration") return "address-registration";
  if (category === "visa-immigration") return "residence-permit-renewal";
  if (category === "work-business") return "freelance-tax-registration";
  if (!category && analysis.issuingAuthority.includes("Einwanderung")) return "residence-permit-renewal";
  return "unsupported";
}

export function applyResearchToAnalysis(analysis: CaseAnalysis, research: ResearchCaseResult): CaseAnalysis {
  const verifiedResearch = research.summary.status === "verified" || research.summary.status === "partial" || research.summary.status === "conflict";
  const evidenceByStep = new Map(research.stepEvidence.map((item) => [item.stepOrder, item]));
  const documentDeadlineClaim = {
    id: "claim-detected-deadline",
    text: deadlineClaimText(analysis),
    kind: "document-fact" as const,
    supportStatus: "unsupported" as const,
    sourceIds: [],
    jurisdiction: "Original document",
  };
  return {
    ...analysis,
    nextSteps: analysis.nextSteps.map((step) => {
      const evidence = evidenceByStep.get(step.order);
      return evidence
        ? { ...step, claimIds: [...evidence.claimIds], officialSourceIds: [...evidence.sourceIds] }
        : { ...step, claimIds: [], officialSourceIds: [] };
    }),
    officialSources: verifiedResearch ? research.sources : analysis.officialSources,
    routeClaims: [documentDeadlineClaim, ...research.claims],
    research: research.summary,
    deadlineProvenance: {
      kind: "document-fact",
      sourceIds: [],
      confirmationRequired: true,
    },
  };
}

export function markResearchUnavailable(analysis: CaseAnalysis): CaseAnalysis {
  const summary: CaseResearchSummary = {
    status: "unavailable",
    researchedAt: null,
    provider: "mock-fallback",
    limitations: ["Official-source research was unavailable. Existing route guidance remains unverified."],
    escalation: "Confirm unresolved steps through the responsible authority's official contact channel.",
  };
  return { ...analysis, research: summary, deadlineProvenance: { kind: "document-fact", sourceIds: [], confirmationRequired: true } };
}

function deadlineClaimText(analysis: CaseAnalysis): string {
  if (analysis.outputLanguage === "de") return `Die erkannte Frist ${analysis.detectedDeadline} stammt aus dem Dokument und muss am Original geprüft werden.`;
  if (analysis.outputLanguage === "ar") return `المهلة المكتشفة ${analysis.detectedDeadline} مأخوذة من المستند ويجب تأكيدها من الأصل.`;
  return `The detected deadline ${analysis.detectedDeadline} comes from the document and must be confirmed against the original.`;
}

function parseError(payload: unknown): ResearchApiError {
  const candidate = payload as Partial<ResearchCaseErrorResponse> | null;
  const code = candidate?.error?.code;
  return new ResearchApiError(isResearchErrorCode(code) ? code : "INTERNAL_ERROR", typeof candidate?.error?.requestId === "string" ? candidate.error.requestId : null);
}

function isSuccess(payload: unknown): payload is ResearchCaseSuccessResponse {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as Partial<ResearchCaseSuccessResponse>;
  return Boolean(candidate.research && candidate.metadata?.inputScope === "abstract-route-topic-only" && candidate.metadata.retentionStatus === "discarded-after-processing");
}
