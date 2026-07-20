import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnalysisResult } from "@/components/case/analysis-result";
import { RESULT_COPY } from "@/i18n/case-copy";
import { createGoalCaseInput } from "@/lib/case-input";
import { ROUTE_EXPORT_FILE_NAME } from "@/lib/route-export";
import { buildMockCaseAnalysis } from "@/mocks/case-analysis";

const SYNTHETIC_GOAL = "I need to renew my fictional residence permit before the deadline.";

function buildAnalysis(language: "en" | "de" | "ar" = "en") {
  const result = createGoalCaseInput(SYNTHETIC_GOAL, language, null);
  if (!result.valid) throw new Error("Synthetic goal fixture must be valid");
  return buildMockCaseAnalysis(result.input);
}

describe("AnalysisResult", () => {
  const createObjectURL = vi.fn(() => "blob:mock-route");
  const revokeObjectURL = vi.fn();
  const urlStatics = URL as unknown as {
    createObjectURL?: typeof createObjectURL;
    revokeObjectURL?: typeof revokeObjectURL;
  };

  beforeEach(() => {
    urlStatics.createObjectURL = createObjectURL;
    urlStatics.revokeObjectURL = revokeObjectURL;
  });

  afterEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    delete urlStatics.createObjectURL;
    delete urlStatics.revokeObjectURL;
  });

  it("shows the deadline and first action above the long summary", () => {
    render(
      <AnalysisResult analysis={buildAnalysis()} onAnswer={vi.fn()} onStartOver={vi.fn()} showClarification={false} />,
    );

    const deadlineHeading = screen.getByRole("heading", { name: RESULT_COPY.en.deadlineAndUrgency });
    const firstActionHeading = screen.getByRole("heading", { name: RESULT_COPY.en.firstAction });
    // The fixture is a goal-only case, so the summary heading must not claim a letter.
    const summaryHeading = screen.getByRole("heading", { name: RESULT_COPY.en.summaryFromGoal });

    expect(deadlineHeading.compareDocumentPosition(firstActionHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(firstActionHeading.compareDocumentPosition(summaryHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("names the first recommended step inside the first-action card", () => {
    const analysis = buildAnalysis();
    render(
      <AnalysisResult analysis={analysis} onAnswer={vi.fn()} onStartOver={vi.fn()} showClarification={false} />,
    );

    const firstActionSection = screen.getByRole("heading", { name: RESULT_COPY.en.firstAction }).closest("section");
    expect(firstActionSection).toHaveTextContent(analysis.nextSteps[0].title);
  });

  it("downloads the route locally with a fixed personal-data-free file name", async () => {
    const user = userEvent.setup();
    const anchorClicks: string[] = [];
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        anchorClicks.push(this.download);
      });

    try {
      render(
        <AnalysisResult analysis={buildAnalysis()} onAnswer={vi.fn()} onStartOver={vi.fn()} showClarification={false} />,
      );

      await user.click(screen.getByRole("button", { name: /download route/i }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toContain("text/plain");
      expect(await blob.text()).toContain(RESULT_COPY.en.firstAction);
      expect(anchorClicks).toEqual([ROUTE_EXPORT_FILE_NAME]);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-route");
      expect(ROUTE_EXPORT_FILE_NAME).not.toContain("residence");
    } finally {
      clickSpy.mockRestore();
    }
  });

  it("keeps Arabic routes right-to-left with the localized first action", () => {
    render(
      <AnalysisResult analysis={buildAnalysis("ar")} onAnswer={vi.fn()} onStartOver={vi.fn()} showClarification={false} />,
    );

    expect(screen.getByTestId("analysis-result")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("heading", { name: RESULT_COPY.ar.firstAction })).toBeInTheDocument();
  });
});
