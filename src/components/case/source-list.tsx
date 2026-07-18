import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export function SourceList({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];

  return (
    <section aria-labelledby="sources-heading" className="rounded-2xl border border-[#d8ddd9] bg-white p-5 sm:p-6">
      <h2 id="sources-heading" className="text-xl font-semibold text-[#202d26]">
        {copy.sources}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#68736d]">
        {copy.placeholderSource}. {copy.sourceNotAccessed}.
      </p>
      <ul className="mt-4 space-y-3">
        {analysis.officialSources.map((source) => (
          <li key={source.id} className="rounded-xl border border-[#dce1dd] bg-[#fafbf9] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#28362f]">{source.title}</h3>
                <p className="mt-1 text-sm text-[#69746e]">{source.publisher}</p>
              </div>
              <span className="rounded-full border border-[#ddc996] bg-[#fff9e9] px-2.5 py-1 text-[0.68rem] font-semibold text-[#795b18]">
                {copy.placeholderSource}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#657169]">
              <span className="font-semibold">{copy.supports}: </span>
              {source.supports.join(" · ")}
            </p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className="mt-3 inline-flex rounded-md text-sm font-semibold text-[#176447] underline decoration-[#95b8a8] underline-offset-4 outline-none hover:text-[#0e4933] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
            >
              {source.domain}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
