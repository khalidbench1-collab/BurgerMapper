import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export function RouteTimeline({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const claims = new Map((analysis.routeClaims ?? []).map((claim) => [claim.id, claim]));
  const sources = new Map(analysis.officialSources.map((source) => [source.id, source]));

  return (
    <section aria-labelledby="route-heading" className="rounded-2xl border border-[#cbd7d0] bg-[#f5f9f7] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 id="route-heading" className="text-xl font-semibold text-[#1e3027]">
          {copy.nextSteps}
        </h2>
        <span className="text-xs font-semibold text-[#39715a]">
          {analysis.nextSteps.length} steps
        </span>
      </div>

      <ol className="mt-5 space-y-4">
        {analysis.nextSteps.map((step) => (
          <li key={step.order} className="grid grid-cols-[2rem_1fr] gap-3 rounded-xl border border-[#d6dfda] bg-white p-4 sm:grid-cols-[2.5rem_1fr] sm:p-5">
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f6d50] text-sm font-bold text-white sm:h-10 sm:w-10">
              {step.order}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-[#22332a]">{step.title}</h3>
                <span className="rounded-full border border-[#d3dad6] bg-[#f6f7f5] px-2.5 py-1 text-[0.68rem] font-semibold text-[#58655e]">
                  {copy.stepStatus[step.status]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#637068]">{step.description}</p>
              {(step.claimIds ?? []).map((claimId) => {
                const claim = claims.get(claimId);
                if (!claim) return null;
                return (
                  <div key={claimId} className="mt-3 rounded-lg border border-[#dce4df] bg-[#f8faf8] p-3 text-xs leading-5 text-[#526158]">
                    <p>
                      <span className="font-semibold">{claimKindLabel(claim.kind, analysis.outputLanguage)}: </span>
                      {claim.text}
                    </p>
                    {claim.sourceIds.length ? (
                      <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                        {claim.sourceIds.map((sourceId, index) => {
                          const source = sources.get(sourceId);
                          return source ? (
                            <a key={sourceId} href={source.url} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-semibold text-[#176447] underline underline-offset-3 outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35">
                              [{index + 1}] {source.publisher}<span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          ) : null;
                        })}
                      </p>
                    ) : null}
                  </div>
                );
              })}
              <dl className="mt-3 grid gap-2 text-xs text-[#66726b] sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[#45534b]">{copy.responsible}</dt>
                  <dd className="mt-0.5">{step.responsibleParty}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#45534b]">{copy.timing}</dt>
                  <dd className="mt-0.5">{step.timing}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function claimKindLabel(kind: NonNullable<CaseAnalysis["routeClaims"]>[number]["kind"], language: CaseAnalysis["outputLanguage"]): string {
  const labels = {
    en: { law: "Law", "official-service-guidance": "Official service guidance", "local-administrative-practice": "Berlin administrative practice", "document-fact": "Document fact", "model-inference": "Interpretation", "unresolved-uncertainty": "Unresolved" },
    de: { law: "Gesetz", "official-service-guidance": "Offizielle Dienstleistungshinweise", "local-administrative-practice": "Berliner Verwaltungspraxis", "document-fact": "Dokumentangabe", "model-inference": "Einordnung", "unresolved-uncertainty": "Ungeklärt" },
    ar: { law: "قانون", "official-service-guidance": "إرشادات خدمة رسمية", "local-administrative-practice": "ممارسة إدارية في برلين", "document-fact": "حقيقة من المستند", "model-inference": "تفسير", "unresolved-uncertainty": "غير محسوم" },
  } as const;
  return labels[language][kind];
}
