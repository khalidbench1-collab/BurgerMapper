import type { SupportedLanguage } from "@/domain/case";
import type { ResearchCaseRequest, ResearchCaseResult, ResearchTopic } from "@/domain/research-api";
import {
  getCuratedOfficialSources,
  isAllowedOfficialUrl,
  type OfficialSourceRecord,
} from "@/server/research/official-sources";

export interface OfficialSourceRetriever {
  retrieve(topic: ResearchTopic, language: SupportedLanguage): Promise<{
    records: OfficialSourceRecord[];
    stepEvidence: ResearchCaseResult["stepEvidence"];
  }>;
}

export class CuratedOfficialSourceRetriever implements OfficialSourceRetriever {
  async retrieve(topic: ResearchTopic, language: SupportedLanguage) {
    return getCuratedOfficialSources(topic, language);
  }
}

export async function researchOfficialSources(
  input: ResearchCaseRequest,
  retriever: OfficialSourceRetriever = new CuratedOfficialSourceRetriever(),
  now = () => new Date(),
): Promise<ResearchCaseResult> {
  if (input.profileSufficiency !== "sufficient") {
    throw new ResearchServiceError("PROFILE_NOT_SUFFICIENT", 409);
  }
  let retrieved: Awaited<ReturnType<OfficialSourceRetriever["retrieve"]>>;
  try {
    retrieved = await retriever.retrieve(input.topic, input.outputLanguage);
  } catch {
    throw new ResearchServiceError("RESEARCH_UNAVAILABLE", 503);
  }
  const researchedAt = now();
  const records = retrieved.records.filter((record) =>
    isAllowedOfficialUrl(record.source.url) &&
    record.source.domain === new URL(record.source.url).hostname &&
    record.source.httpStatus === 200 &&
    Boolean(record.source.publisher.trim() && record.source.title.trim()) &&
    isFresh(record.source.accessedAt, researchedAt),
  );
  const sourceIds = new Set(records.map((record) => record.source.id));
  const claims = deduplicateClaims(records.flatMap((record) => record.claims)).map((claim) => {
    const validSourceIds = claim.sourceIds.filter((sourceId) => sourceIds.has(sourceId));
    return {
      ...claim,
      sourceIds: validSourceIds,
      supportStatus: validSourceIds.length ? claim.supportStatus : "unsupported" as const,
    };
  });
  const hasConflict = records.some((record) => record.source.conflictStatus === "conflict") ||
    claims.some((claim) => claim.supportStatus === "conflicting");
  const usableClaims = claims.filter((claim) => claim.sourceIds.length > 0 && claim.supportStatus !== "unsupported");
  const status = hasConflict ? "conflict" : usableClaims.length === 0 ? "no-sources" : records.length < retrieved.records.length ? "partial" : "verified";
  const limitations = limitationsFor(status, input.outputLanguage);
  return {
    sources: records.map((record) => record.source),
    claims,
    stepEvidence: retrieved.stepEvidence.map((evidence) => ({
      stepOrder: evidence.stepOrder,
      claimIds: evidence.claimIds.filter((id) => usableClaims.some((claim) => claim.id === id)),
      sourceIds: evidence.sourceIds.filter((id) => sourceIds.has(id)),
    })).filter((evidence) => evidence.claimIds.length > 0),
    summary: {
      status,
      researchedAt: researchedAt.toISOString(),
      provider: "curated-official-sources",
      limitations,
      escalation: status === "verified" ? null : escalationFor(input.outputLanguage),
    },
  };
}

function isFresh(accessedAt: string | null, now: Date): boolean {
  if (!accessedAt) return false;
  const accessed = new Date(accessedAt);
  if (Number.isNaN(accessed.getTime()) || accessed > now) return false;
  return now.getTime() - accessed.getTime() <= 365 * 24 * 60 * 60 * 1000;
}

export class ResearchServiceError extends Error {
  constructor(public readonly code: "PROFILE_NOT_SUFFICIENT" | "RESEARCH_UNAVAILABLE", public readonly status: number) {
    super(code);
    this.name = "ResearchServiceError";
  }
}

function deduplicateClaims(claims: ResearchCaseResult["claims"]): ResearchCaseResult["claims"] {
  const merged = new Map<string, ResearchCaseResult["claims"][number]>();
  for (const claim of claims) {
    const current = merged.get(claim.id);
    if (!current) merged.set(claim.id, { ...claim, sourceIds: [...claim.sourceIds] });
    else merged.set(claim.id, { ...current, sourceIds: [...new Set([...current.sourceIds, ...claim.sourceIds])] });
  }
  return [...merged.values()];
}

function limitationsFor(status: ResearchCaseResult["summary"]["status"], language: SupportedLanguage): string[] {
  const messages = {
    en: {
      verified: "Sources support only the claims cited beside the route; they do not verify the fictional letter or personal eligibility.",
      fallback: "No adequate current official source was available for this mock topic. Keep the route as unverified guidance.",
      conflict: "Official sources conflict or differ in scope. Confirm the route with the responsible authority.",
    },
    de: {
      verified: "Die Quellen belegen nur die direkt am Weg zitierten Aussagen; sie bestätigen weder das fiktive Schreiben noch die persönliche Berechtigung.",
      fallback: "Für dieses Demo-Thema war keine ausreichende aktuelle offizielle Quelle verfügbar. Der Weg bleibt unverifiziert.",
      conflict: "Offizielle Quellen widersprechen sich oder haben einen anderen Geltungsbereich. Klären Sie den Weg mit der zuständigen Behörde.",
    },
    ar: {
      verified: "تدعم المصادر الادعاءات المذكورة بجانب المسار فقط، ولا تتحقق من الخطاب الخيالي أو الأهلية الشخصية.",
      fallback: "لم يتوفر مصدر رسمي حالي وكافٍ لهذا الموضوع التجريبي. يبقى المسار غير متحقق منه.",
      conflict: "تتعارض المصادر الرسمية أو تختلف في نطاقها. تحقق من المسار لدى الجهة المختصة.",
    },
  }[language];
  return [status === "verified" ? messages.verified : status === "conflict" ? messages.conflict : messages.fallback];
}

function escalationFor(language: SupportedLanguage): string {
  return {
    en: "Use the official authority contact channel before relying on an unresolved step.",
    de: "Nutzen Sie den offiziellen Kontaktweg der Behörde, bevor Sie sich auf einen ungeklärten Schritt verlassen.",
    ar: "استخدم قناة الاتصال الرسمية بالجهة قبل الاعتماد على خطوة غير محسومة.",
  }[language];
}
