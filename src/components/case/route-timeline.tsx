import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export function RouteTimeline({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];

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
