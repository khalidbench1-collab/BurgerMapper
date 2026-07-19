import { AnalysisSummary } from "@/components/case/analysis-summary";
import { ClarificationCard } from "@/components/case/clarification-card";
import { DeadlineCard } from "@/components/case/deadline-card";
import { Disclaimer } from "@/components/case/disclaimer";
import { RequirementsList } from "@/components/case/requirements-list";
import { RouteTimeline } from "@/components/case/route-timeline";
import { SourceList } from "@/components/case/source-list";
import type {
  CaseAnalysis,
  ClarificationAnswerId,
} from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";
import { buildRouteExportText, ROUTE_EXPORT_FILE_NAME } from "@/lib/route-export";

export function AnalysisResult({
  analysis,
  onAnswer,
  onStartOver,
  showClarification = true,
}: {
  analysis: CaseAnalysis;
  onAnswer: (answer: ClarificationAnswerId) => void;
  onStartOver: () => void;
  showClarification?: boolean;
}) {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const direction = analysis.outputLanguage === "ar" ? "rtl" : "ltr";

  function handleDownload() {
    const blob = new Blob([buildRouteExportText(analysis)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ROUTE_EXPORT_FILE_NAME;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden" dir="ltr">
        <p className="text-sm font-medium text-[#5f6c65]">{analysis.isMock ? "Your demo route is ready." : "Your analyzed route is ready."}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl border border-[#bfc7c2] bg-white px-4 py-2.5 text-sm font-semibold text-[#35443c] outline-none hover:border-[#75847b] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
          >
            Download route
            <span className="sr-only"> as a plain-text file saved by your browser</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-[#bfc7c2] bg-white px-4 py-2.5 text-sm font-semibold text-[#35443c] outline-none hover:border-[#75847b] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
          >
            Print route
          </button>
          <button
            type="button"
            onClick={onStartOver}
            className="rounded-xl bg-[#1d664b] px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
          >
            Start over
          </button>
        </div>
      </div>

      <article
        data-testid="analysis-result"
        dir={direction}
        lang={analysis.outputLanguage}
        aria-label={analysis.isMock ? copy.mockBadge : "OpenAI analysis"}
        className="print-surface space-y-5 rounded-[1.5rem] border border-[#d6dbd7] bg-[#fbfbf8] p-4 shadow-[0_18px_60px_rgba(29,47,38,0.08)] sm:p-7"
      >
        <DeadlineCard analysis={analysis} />
        <FirstActionCard analysis={analysis} />
        <AnalysisSummary analysis={analysis} />

        <section aria-labelledby="authority-wants-heading" className="rounded-2xl border border-[#d8ddd9] bg-white p-5 sm:p-6">
          <h2 id="authority-wants-heading" className="text-xl font-semibold text-[#202d26]">
            {copy.authorityWants}
          </h2>
          <p className="mt-3 text-base leading-7 text-[#556159]">
            {analysis.whatTheAuthorityWants}
          </p>
        </section>

        <RequirementsList analysis={analysis} />
        {showClarification ? (
          <ClarificationCard analysis={analysis} onAnswer={onAnswer} />
        ) : null}
        <RouteTimeline analysis={analysis} />
        <SourceList analysis={analysis} />
        <Disclaimer analysis={analysis} />
      </article>
    </div>
  );
}

function FirstActionCard({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const firstStep = analysis.nextSteps[0];
  if (!firstStep) return null;

  return (
    <section aria-labelledby="first-action-heading" className="rounded-2xl border border-[#bfd3c8] bg-[#eef7f2] p-5 sm:p-6">
      <h2 id="first-action-heading" className="text-xl font-semibold text-[#1c3a2c]">
        {copy.firstAction}
      </h2>
      <p className="mt-3 text-base font-semibold leading-7 text-[#20402f]">{firstStep.title}</p>
      <p className="mt-1 text-sm leading-6 text-[#42584c]">{firstStep.description}</p>
      <p className="mt-3 text-xs font-medium leading-5 text-[#537263]">
        {copy.responsible}: {firstStep.responsibleParty} — {copy.timing}: {firstStep.timing}
      </p>
    </section>
  );
}
