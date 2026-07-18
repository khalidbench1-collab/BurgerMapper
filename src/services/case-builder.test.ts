import { describe, expect, it } from "vitest";

import type { CaseBuilderResult } from "@/domain/case-profile";
import type { CaseInput } from "@/domain/case";
import {
  answerCaseBuilderQuestion,
  buildMockRouteFromProfile,
  createMockCaseProfile,
  mergeCaseProfileCorrections,
} from "@/services/case-builder";
import { MockDocumentAnalysisService } from "@/services/document-analysis";

async function createResult(input: CaseInput): Promise<CaseBuilderResult> {
  const baseAnalysis = await new MockDocumentAnalysisService(0).analyzeDocument(input);
  const profile = createMockCaseProfile(input, baseAnalysis);
  return {
    profile,
    baseAnalysis,
    analysis: buildMockRouteFromProfile(profile, baseAnalysis),
  };
}

describe("deterministic Case Builder", () => {
  it("constructs a structured profile without retaining evidence content", async () => {
    const result = await createResult({
      kind: "text",
      goal: "Understand which fictional documents are missing.",
      text: "Synthetic official message content that must not enter evidence metadata.",
      category: "visa-immigration",
      outputLanguage: "en",
    });

    expect(result.profile).toMatchObject({
      goal: {
        text: "Understand which fictional documents are missing.",
        source: "user",
      },
      category: "visa-immigration",
      status: "building",
      sufficiency: {
        state: "needs-clarification",
        nextQuestionId: "employment-status",
      },
      evidence: [{ kind: "text", contentRetained: false }],
    });
    expect(JSON.stringify(result.profile.evidence)).not.toContain("Synthetic official");
  });

  it("asks exactly one consequential question with a reason", async () => {
    const result = await createResult({
      kind: "goal",
      goal: "Renew a fictional residence permit.",
      outputLanguage: "en",
    });

    expect(result.profile.askedQuestionIds).toEqual(["employment-status"]);
    expect(new Set(result.profile.askedQuestionIds).size).toBe(1);
    expect(result.baseAnalysis.clarificationQuestion.reason).toContain("changes");
    expect(result.baseAnalysis.clarificationQuestion.options).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "dont-know" })]),
    );
  });

  it("stops questioning once the profile is sufficient and builds the route from the answer", async () => {
    const initial = await createResult({
      kind: "goal",
      goal: "Renew a fictional residence permit.",
      outputLanguage: "en",
    });
    const completed = answerCaseBuilderQuestion(initial, "self-employed", "2026-07-18T13:00:00.000Z");

    expect(completed.profile.sufficiency).toMatchObject({
      state: "sufficient",
      nextQuestionId: null,
    });
    expect(completed.profile.askedQuestionIds).toHaveLength(1);
    expect(completed.analysis.clarificationQuestion.selectedAnswerId).toBe("self-employed");
    expect(completed.analysis.nextSteps[1]).toMatchObject({
      title: "Prepare self-employment income evidence",
      status: "ready",
    });
  });

  it("accepts I don't know and preserves a safe verification uncertainty", async () => {
    const initial = await createResult({
      kind: "sample",
      sampleId: "fictional-residence-renewal-2026",
      outputLanguage: "en",
    });
    const completed = answerCaseBuilderQuestion(initial, "dont-know");

    expect(completed.profile.sufficiency.state).toBe("sufficient");
    expect(completed.profile.sufficiency.reason).toContain("uncertainty recorded");
    expect(completed.analysis.nextSteps[1]).toMatchObject({
      title: "Verify which income evidence applies",
      status: "needs-answer",
    });
    expect(completed.analysis.missingInformation[0]).toContain("work situation");
  });

  it("remembers answer corrections and recomputes the route", async () => {
    const initial = await createResult({
      kind: "goal",
      goal: "Renew a fictional residence permit.",
      outputLanguage: "en",
    });
    const first = answerCaseBuilderQuestion(initial, "employed", "2026-07-18T13:00:00.000Z");
    const corrected = answerCaseBuilderQuestion(first, "both", "2026-07-18T13:05:00.000Z");

    expect(corrected.profile.answers[0].answerId).toBe("both");
    expect(corrected.profile.correctionHistory).toEqual([
      expect.objectContaining({
        field: "clarification-answer",
        summary: expect.stringContaining("changed from Employed to Both"),
      }),
    ]);
    expect(corrected.analysis.nextSteps[1].title).toBe("Prepare both sets of income evidence");
  });

  it("clears downstream answers after a context correction", async () => {
    const initial = await createResult({
      kind: "goal",
      goal: "Renew a fictional residence permit.",
      outputLanguage: "en",
    });
    const answered = answerCaseBuilderQuestion(initial, "employed");
    const rebuilt = await createResult({
      kind: "goal",
      goal: "Register a fictional new address.",
      category: "arrival-registration",
      outputLanguage: "en",
    });
    const corrected = mergeCaseProfileCorrections(
      rebuilt,
      answered.profile,
      [{ field: "goal", summary: "Goal updated; the previous clarification answer was cleared." }],
      "2026-07-18T14:00:00.000Z",
    );

    expect(corrected.profile.answers).toEqual([]);
    expect(corrected.profile.sufficiency.state).toBe("needs-clarification");
    expect(corrected.profile.correctionHistory.at(-1)).toMatchObject({ field: "goal" });
    expect(corrected.analysis.clarificationQuestion.id).toBe("arrival-registration-context");
  });

  it("uses direct, non-judgmental question copy without routine acknowledgements", async () => {
    const result = await createResult({
      kind: "goal",
      goal: "Renew a fictional residence permit.",
      outputLanguage: "en",
    });
    const copy = `${result.baseAnalysis.clarificationQuestion.prompt} ${result.baseAnalysis.clarificationQuestion.reason}`;

    expect(copy).not.toMatch(/great|good job|don't worry|obviously|you should have/i);
    expect(copy).not.toMatch(/thanks for sharing|i understand/i);
  });
});
