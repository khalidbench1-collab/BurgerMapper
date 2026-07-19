import { MockModeBadge } from "@/components/case/mock-mode-badge";
import { getCategoryDefinition } from "@/domain/categories";
import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";
import { formatCaseDate } from "@/lib/date-format";

export function AnalysisSummary({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const category = analysis.category
    ? getCategoryDefinition(analysis.category)
    : null;

  return (
    <section aria-labelledby="analysis-summary-heading" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <MockModeBadge mode={analysis.isMock ? "mock" : "openai"} label={analysis.isMock ? copy.mockBadge : "OpenAI analysis"} />
          <h2 id="analysis-summary-heading" className="mt-4 max-w-3xl text-2xl font-semibold tracking-[-0.035em] text-[#18271f] sm:text-3xl">
            {analysis.documentTitle}
          </h2>
        </div>
        <p className="rounded-lg border border-[#d9ddd8] bg-white px-3 py-2 text-xs font-medium text-[#647068]">
          {analysis.documentLanguage}
        </p>
      </div>

      <aside className="rounded-2xl border border-[#d9ddd8] bg-white p-4 text-sm leading-6 text-[#5c6861]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#2a3931]">
            Case category: {category?.label ?? "Not selected"}
          </span>
          <span className="rounded-full bg-[#f0f2ef] px-2 py-0.5 text-[0.68rem] font-semibold text-[#5d6862]">
            Orientation only
          </span>
        </div>
        <p className="mt-1">{analysis.mockContext}</p>
      </aside>

      <div className="rounded-2xl border border-[#cbd8d1] bg-[#f3f8f5] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#28664e]">
          {copy.extractedFacts}
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Fact label={copy.issuingAuthority} value={analysis.issuingAuthority} />
          <Fact label={copy.documentType} value={analysis.documentType} />
          <Fact
            label={copy.letterDate}
            value={formatCaseDate(analysis.detectedDate, analysis.outputLanguage)}
            dateTime={analysis.detectedDate}
          />
          <Fact
            label={copy.deadline}
            value={formatCaseDate(analysis.detectedDeadline, analysis.outputLanguage)}
            dateTime={analysis.detectedDeadline}
          />
        </dl>
      </div>

      <article className="rounded-2xl border border-[#e1d8c9] bg-[#fffdf8] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a5a2f]">
          {analysis.isMock ? copy.mockBadge : "Model interpretation"}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[#202c26]">{copy.summary}</h3>
        <p className="mt-3 text-base leading-7 text-[#4d5b54]">{analysis.summary}</p>
      </article>
    </section>
  );
}

function Fact({
  label,
  value,
  dateTime,
}: {
  label: string;
  value: string;
  dateTime?: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-[#67736c]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-[#203028]">
        {dateTime ? (
          <time dateTime={dateTime} dir="auto">
            {value}
          </time>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
