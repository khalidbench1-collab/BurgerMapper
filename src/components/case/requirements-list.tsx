import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export function RequirementsList({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];

  return (
    <section aria-labelledby="requirements-heading" className="rounded-2xl border border-[#d8ddd9] bg-white p-5 sm:p-6">
      <h2 id="requirements-heading" className="text-xl font-semibold text-[#202d26]">
        {copy.documents}
      </h2>
      <ul className="mt-4 divide-y divide-[#e5e8e5]">
        {analysis.requiredDocuments.map((document) => (
          <li key={document.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#aebeb5] bg-[#f3f8f5] text-xs font-bold text-[#246449]">
              ✓
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#26342d]">{document.title}</h3>
                <span className="rounded-full bg-[#f0f2ef] px-2 py-1 text-[0.68rem] font-semibold text-[#66716b]">
                  {document.status === "required" ? copy.required : copy.dependsOnAnswer}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[#67726c]">{document.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
