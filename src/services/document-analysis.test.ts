import { describe, expect, it } from "vitest";

import type { SupportedLanguage } from "@/domain/case";
import { createSampleDocument } from "@/lib/file-validation";
import {
  adaptAnalysisToClarification,
  MockDocumentAnalysisService,
} from "@/services/document-analysis";

describe("MockDocumentAnalysisService", () => {
  it.each<SupportedLanguage>(["en", "de", "ar"])(
    "returns the complete typed contract for %s",
    async (outputLanguage) => {
      const service = new MockDocumentAnalysisService(0);
      const result = await service.analyzeDocument({
        document: createSampleDocument(),
        outputLanguage,
      });

      expect(result).toMatchObject({
        id: `mock-analysis-${outputLanguage}`,
        issuingAuthority: "Landesamt für Einwanderung Berlin",
        documentLanguage: expect.any(String),
        detectedDate: "2026-07-08",
        detectedDeadline: "2026-07-22",
        urgency: "high",
        outputLanguage,
        isMock: true,
      });
      expect(result.summary).toEqual(expect.any(String));
      expect(result.whatTheAuthorityWants).toEqual(expect.any(String));
      expect(result.requiredDocuments).toHaveLength(3);
      expect(result.missingInformation.length).toBeGreaterThan(0);
      expect(result.clarificationQuestion.options).toHaveLength(3);
      expect(result.nextSteps).toHaveLength(4);
      expect(result.officialSources).toHaveLength(2);
      expect(result.officialSources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            verificationStatus: "placeholder-unverified",
            accessedAt: null,
          }),
        ]),
      );
      expect(result.disclaimer).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(result.generatedAt))).toBe(false);
    },
  );

  it("adapts the income document and route to the clarification answer", async () => {
    const service = new MockDocumentAnalysisService(0);
    const initial = await service.analyzeDocument({
      document: createSampleDocument(),
      outputLanguage: "en",
    });

    const adapted = adaptAnalysisToClarification(initial, "self-employed");

    expect(adapted.clarificationQuestion.selectedAnswerId).toBe("self-employed");
    expect(adapted.requiredDocuments.find((item) => item.id === "income-evidence"))
      .toMatchObject({
        title: "Self-employment income evidence",
        status: "required",
      });
    expect(adapted.nextSteps[1]).toMatchObject({
      title: "Prepare self-employment income evidence",
      status: "ready",
    });
    expect(adapted.missingInformation).toEqual([
      "The accepted submission channel still needs official verification.",
    ]);
  });
});
