import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";
import { formatCaseDate } from "@/lib/date-format";

export function DeadlineCard({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];

  return (
    <section aria-labelledby="deadline-heading" className="rounded-2xl border border-[#e2c7b7] bg-[#fff8f3] p-5 sm:p-6">
      <h2 id="deadline-heading" className="text-xl font-semibold text-[#39261e]">
        {copy.deadlineAndUrgency}
      </h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#7f5542]">{copy.deadline}</p>
          <time dateTime={analysis.detectedDeadline} dir="auto" className="mt-1 block text-2xl font-semibold tracking-[-0.025em] text-[#8f3f26]">
            {formatCaseDate(analysis.detectedDeadline, analysis.outputLanguage)}
          </time>
        </div>
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8a58f] bg-white px-3 py-2 text-sm font-semibold text-[#8c3d28]">
          <span aria-hidden="true">!</span>
          {copy.urgency}: {copy.urgencyLevel[analysis.urgency]}
        </p>
      </div>
      {analysis.deadlineProvenance?.confirmationRequired ? (
        <p className="mt-3 text-xs leading-5 text-[#6b554a]">
          {analysis.outputLanguage === "de"
            ? "Dokumentangabe: Prüfen Sie dieses Datum am Originalschreiben; es wurde nicht durch eine offizielle Quelle bestätigt."
            : analysis.outputLanguage === "ar"
              ? "حقيقة من المستند: أكّد هذا التاريخ من الخطاب الأصلي؛ لم يتم التحقق منه بواسطة مصدر رسمي."
              : "Document fact: confirm this date against the original letter; it has not been verified by an official source."}
        </p>
      ) : null}

      <div className="mt-5 border-t border-[#ead5ca] pt-5">
        <p className="text-sm font-semibold text-[#5e4539]">{copy.clarification}</p>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-[#6b554a]">
          {analysis.missingInformation.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
