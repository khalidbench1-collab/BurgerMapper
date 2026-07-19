import { describe, expect, it } from "vitest";

import { RESULT_COPY } from "@/i18n/case-copy";
import { createGoalCaseInput } from "@/lib/case-input";
import { buildRouteExportText, ROUTE_EXPORT_FILE_NAME } from "@/lib/route-export";
import { buildMockCaseAnalysis } from "@/mocks/case-analysis";

const SYNTHETIC_GOAL = "I need to renew my fictional residence permit before the deadline.";

function buildAnalysis(language: "en" | "de" | "ar" = "en") {
  const result = createGoalCaseInput(SYNTHETIC_GOAL, language, null);
  if (!result.valid) throw new Error("Synthetic goal fixture must be valid");
  return buildMockCaseAnalysis(result.input);
}

describe("route export", () => {
  it("uses a fixed file name that cannot contain personal data", () => {
    expect(ROUTE_EXPORT_FILE_NAME).toBe("burgermapper-route.txt");
  });

  it("puts the deadline and first action before the step list", () => {
    const analysis = buildAnalysis();
    const text = buildRouteExportText(analysis);
    const copy = RESULT_COPY.en;

    const deadlineIndex = text.indexOf(copy.deadlineAndUrgency);
    const firstActionIndex = text.indexOf(copy.firstAction);
    const stepsIndex = text.indexOf(copy.nextSteps);

    expect(deadlineIndex).toBeGreaterThanOrEqual(0);
    expect(firstActionIndex).toBeGreaterThan(deadlineIndex);
    expect(stepsIndex).toBeGreaterThan(firstActionIndex);
  });

  it("contains the first step, urgency, and limitation from the analysis", () => {
    const analysis = buildAnalysis();
    const text = buildRouteExportText(analysis);

    expect(text).toContain(analysis.nextSteps[0].title);
    expect(text).toContain(RESULT_COPY.en.urgencyLevel[analysis.urgency]);
    expect(text).toContain(analysis.disclaimer);
  });

  it("localizes the export labels for Arabic output", () => {
    const analysis = buildAnalysis("ar");
    const text = buildRouteExportText(analysis);

    expect(text).toContain(RESULT_COPY.ar.deadlineAndUrgency);
    expect(text).toContain(RESULT_COPY.ar.firstAction);
    expect(text).toContain(RESULT_COPY.ar.limitation);
  });

  it("lists every official source with its URL", () => {
    const analysis = buildAnalysis();
    const text = buildRouteExportText(analysis);

    for (const source of analysis.officialSources) {
      expect(text).toContain(source.url);
    }
  });
});
