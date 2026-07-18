import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export function Disclaimer({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];

  return (
    <section aria-labelledby="limitation-heading" className="rounded-2xl border border-[#d7d9d7] bg-[#f1f2ef] p-5 sm:p-6">
      <h2 id="limitation-heading" className="text-lg font-semibold text-[#323a35]">
        {copy.limitation}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#59625d]">{analysis.disclaimer}</p>
    </section>
  );
}
