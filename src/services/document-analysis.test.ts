import { describe, expect, it } from "vitest";

import type { SupportedLanguage } from "@/domain/case";
import { createSampleCaseInput } from "@/lib/case-input";
import {
  adaptAnalysisToClarification,
  MockDocumentAnalysisService,
} from "@/services/document-analysis";

describe("MockDocumentAnalysisService", () => {
  it.each<SupportedLanguage>(["en", "de", "ar"])(
    "returns the complete typed contract for %s",
    async (outputLanguage) => {
      const service = new MockDocumentAnalysisService(0);
      const result = await service.analyzeDocument(
        createSampleCaseInput(
          "fictional-residence-renewal-2026",
          outputLanguage,
          null,
        ),
      );

      expect(result).toMatchObject({
        id: `mock-analysis-sample-general-${outputLanguage}`,
        issuingAuthority: "Landesamt für Einwanderung Berlin",
        documentLanguage: expect.any(String),
        detectedDate: "2026-07-08",
        detectedDeadline: "2026-07-22",
        urgency: "high",
        outputLanguage,
        inputKind: "sample",
        category: null,
        isMock: true,
      });
      expect(result.summary).toEqual(expect.any(String));
      expect(result.mockContext).toEqual(expect.any(String));
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

  it("accepts normalized text input without pretending to interpret it", async () => {
    const service = new MockDocumentAnalysisService(0);
    const result = await service.analyzeDocument({
      kind: "text",
      text: "A normalized fictional official message for contract testing.",
      category: "arrival-registration",
      outputLanguage: "en",
    });

    expect(result).toMatchObject({
      inputKind: "text",
      category: "arrival-registration",
      documentType: "Anmeldung follow-up",
    });
    expect(result.mockContext).toContain(
      "pasted text was validated in memory by the application server",
    );
    expect(result.mockContext).toContain("not interpreted or understood by AI");
    expect(result.summary).toContain("No pasted text or uploaded file was interpreted");
  });

  it("creates a small category-aware Work & Business variation", async () => {
    const service = new MockDocumentAnalysisService(0);
    const result = await service.analyzeDocument(
      createSampleCaseInput(
        "fictional-residence-renewal-2026",
        "en",
        "work-business",
      ),
    );

    expect(result.documentType).toBe("Freelance tax-registration follow-up");
    expect(result.clarificationQuestion.options[0].id).toBe("freelance-only");
  });

  it("adapts the income document and route to the clarification answer", async () => {
    const service = new MockDocumentAnalysisService(0);
    const initial = await service.analyzeDocument(
      createSampleCaseInput(
        "fictional-residence-renewal-2026",
        "en",
        "visa-immigration",
      ),
    );

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
  });

  it("adapts the Arrival & Registration route question", async () => {
    const service = new MockDocumentAnalysisService(0);
    const initial = await service.analyzeDocument({
      kind: "text",
      text: "Fictional normalized message for an address registration follow-up.",
      category: "arrival-registration",
      outputLanguage: "en",
    });

    const adapted = adaptAnalysisToClarification(initial, "primary-residence");

    expect(adapted.clarificationQuestion.selectedAnswerId).toBe(
      "primary-residence",
    );
    expect(adapted.nextSteps[1]).toMatchObject({
      title: "Prepare the primary-residence details.",
      status: "ready",
    });
  });
});
