import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export function SourceList({ analysis }: { analysis: CaseAnalysis }) {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const research = analysis.research;
  const statusCopy = sourceStatusCopy(analysis.outputLanguage);

  return (
    <section aria-labelledby="sources-heading" className="rounded-2xl border border-[#d8ddd9] bg-white p-5 sm:p-6">
      <h2 id="sources-heading" className="text-xl font-semibold text-[#202d26]">
        {copy.sources}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#68736d]">
        {research ? statusCopy.summary[research.status] : `${copy.placeholderSource}. ${copy.sourceNotAccessed}.`}
      </p>
      {research?.limitations.map((limitation) => <p key={limitation} className="mt-2 text-sm leading-6 text-[#68736d]">{limitation}</p>)}
      <ul className="mt-4 space-y-3">
        {analysis.officialSources.map((source) => (
          <li key={source.id} className="rounded-xl border border-[#dce1dd] bg-[#fafbf9] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#28362f]">{source.title}</h3>
                <p className="mt-1 text-sm text-[#69746e]">{source.publisher}</p>
              </div>
              <span className="rounded-full border border-[#ddc996] bg-[#fff9e9] px-2.5 py-1 text-[0.68rem] font-semibold text-[#795b18]">
                {statusCopy.verification[source.verificationStatus]}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#657169]">
              <span className="font-semibold">{source.verificationStatus === "verified" ? statusCopy.supports : copy.supports}: </span>
              {source.supports.join(" · ")}
            </p>
            {source.accessedAt ? (
              <p className="mt-2 text-xs text-[#657169]">
                {statusCopy.accessed}: <time dateTime={source.accessedAt} dir="ltr">{source.accessedAt.slice(0, 10)}</time>
                {source.jurisdiction ? ` · ${source.jurisdiction}` : ""}
              </p>
            ) : null}
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
      {research?.escalation ? <p className="mt-4 rounded-xl border border-[#e3cdb1] bg-[#fffaf1] p-3 text-sm leading-6 text-[#6c5129]"><span className="font-semibold">{statusCopy.escalation}: </span>{research.escalation}</p> : null}
    </section>
  );
}

function sourceStatusCopy(language: CaseAnalysis["outputLanguage"]) {
  return {
    en: {
      summary: { "not-started": "Official research has not started.", verified: "Verified official sources are linked only to the claims they support.", partial: "Some route claims have official support; unresolved claims remain clearly marked.", "no-sources": "No adequate official source was found for this topic.", conflict: "Official sources conflict or differ in scope.", unavailable: "Official-source research is temporarily unavailable." },
      verification: { "placeholder-unverified": "Not verified", "needs-review": "Needs review", verified: "Verified official source", unavailable: "Unavailable", conflicting: "Conflict" },
      supports: "Supports", accessed: "Accessed", escalation: "Verify next",
    },
    de: {
      summary: { "not-started": "Die offizielle Recherche wurde noch nicht gestartet.", verified: "Verifizierte offizielle Quellen sind nur mit den Aussagen verknüpft, die sie belegen.", partial: "Einige Aussagen sind offiziell belegt; offene Aussagen bleiben gekennzeichnet.", "no-sources": "Für dieses Demo-Thema wurde keine ausreichende offizielle Quelle gefunden.", conflict: "Offizielle Quellen widersprechen sich oder unterscheiden sich im Geltungsbereich.", unavailable: "Die offizielle Quellenrecherche ist vorübergehend nicht verfügbar." },
      verification: { "placeholder-unverified": "Nicht verifiziert", "needs-review": "Prüfung erforderlich", verified: "Verifizierte offizielle Quelle", unavailable: "Nicht verfügbar", conflicting: "Konflikt" },
      supports: "Belegt", accessed: "Abgerufen", escalation: "Nächste Prüfung",
    },
    ar: {
      summary: { "not-started": "لم يبدأ البحث الرسمي بعد.", verified: "ترتبط المصادر الرسمية المتحقق منها فقط بالادعاءات التي تدعمها.", partial: "بعض ادعاءات المسار مدعومة رسميًا وتظل الادعاءات غير المحسومة واضحة.", "no-sources": "لم يُعثر على مصدر رسمي كافٍ لهذا الموضوع التجريبي.", conflict: "تتعارض المصادر الرسمية أو تختلف في نطاقها.", unavailable: "البحث في المصادر الرسمية غير متاح مؤقتًا." },
      verification: { "placeholder-unverified": "غير متحقق منه", "needs-review": "يحتاج إلى مراجعة", verified: "مصدر رسمي متحقق منه", unavailable: "غير متاح", conflicting: "تعارض" },
      supports: "يدعم", accessed: "تاريخ الوصول", escalation: "التحقق التالي",
    },
  }[language];
}
