import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RouteTimeline } from "@/components/case/route-timeline";
import { SourceList } from "@/components/case/source-list";
import { DeadlineCard } from "@/components/case/deadline-card";
import { buildMockCaseAnalysis } from "@/mocks/case-analysis";
import { applyResearchToAnalysis } from "@/services/source-research";
import { getCuratedOfficialSources } from "@/server/research/official-sources";

function researchedArabicAnalysis() {
  const analysis = buildMockCaseAnalysis({ kind: "goal", goal: "هدف تجريبي مفصل بما يكفي للاختبار", outputLanguage: "ar", category: "arrival-registration" });
  const curated = getCuratedOfficialSources("address-registration", "ar");
  return applyResearchToAnalysis(analysis, {
    sources: curated.records.map((record) => record.source),
    claims: curated.records.flatMap((record) => record.claims).filter((claim, index, all) => all.findIndex((candidate) => candidate.id === claim.id) === index),
    stepEvidence: curated.stepEvidence,
    summary: { status: "verified", researchedAt: "2026-07-18T18:00:00.000Z", provider: "curated-official-sources", limitations: ["حدود تجريبية واضحة."], escalation: null },
  });
}

describe("cited route rendering", () => {
  it("renders verified source status and metadata", () => {
    render(<SourceList analysis={researchedArabicAnalysis()} />);
    expect(screen.getAllByText("مصدر رسمي متحقق منه")).toHaveLength(2);
    expect(screen.getAllByText(/2026-07-18/)).toHaveLength(2);
  });

  it("places citations beside supported steps and keeps Arabic URLs LTR", () => {
    render(<RouteTimeline analysis={researchedArabicAnalysis()} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.getAttribute("dir") === "ltr")).toBe(true);
    expect(screen.getAllByText(/إرشادات خدمة رسمية/).length).toBeGreaterThan(0);
  });

  it("renders an official-source conflict without hiding escalation", () => {
    const analysis = researchedArabicAnalysis();
    render(<SourceList analysis={{
      ...analysis,
      officialSources: analysis.officialSources.map((source, index) => index === 0 ? { ...source, verificationStatus: "conflicting", conflictStatus: "conflict" } : source),
      research: { ...analysis.research!, status: "conflict", escalation: "تحقق من الجهة المختصة قبل المتابعة." },
    }} />);
    expect(screen.getByText("تتعارض المصادر الرسمية أو تختلف في نطاقها.")).toBeInTheDocument();
    expect(screen.getByText("تعارض")).toBeInTheDocument();
    expect(screen.getByText(/تحقق من الجهة المختصة/)).toBeInTheDocument();
  });

  it("labels the detected deadline as an unverified document fact", () => {
    render(<DeadlineCard analysis={researchedArabicAnalysis()} />);
    expect(screen.getByText(/حقيقة من المستند/)).toBeInTheDocument();
    expect(screen.getByText(/أكّد هذا التاريخ من وثيقتك الأصلية/)).toBeInTheDocument();
  });

  it("hides the confirm-this-date note when no deadline was detected", () => {
    render(<DeadlineCard analysis={{ ...researchedArabicAnalysis(), detectedDeadline: "" }} />);
    expect(screen.queryByText(/حقيقة من المستند/)).not.toBeInTheDocument();
  });
});
