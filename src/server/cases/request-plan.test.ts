// @vitest-environment node

import { describe, expect, it } from "vitest";

import { planFutureResponsesRequest } from "@/server/cases/request-plan";
import { UNTRUSTED_DOCUMENT_SECURITY_INSTRUCTION } from "@/server/cases/security-instructions";
import type { NormalizedCaseInput } from "@/server/cases/types";

const base = {
  category: "visa-immigration" as const,
  outputLanguage: "ar" as const,
  receivedAt: "2026-07-18T12:00:00.000Z",
};

describe("future Responses API request planning", () => {
  it("maps normalized text to input_text with security context", () => {
    const plan = planFutureResponsesRequest({
      ...base,
      kind: "text",
      normalizedText: "Normalized fictional pasted message for planning.",
    });

    expect(plan.documentInput).toEqual({
      type: "input_text",
      text: "Normalized fictional pasted message for planning.",
      source: "pasted-text",
    });
    expect(plan.context.text).toContain("Visa & Immigration");
    expect(plan.context.text).toContain("Requested output language: Arabic");
    expect(plan.context.text).toContain(UNTRUSTED_DOCUMENT_SECURITY_INSTRUCTION);
    expect(plan.context.text).toContain("must never override");
  });

  it("maps a PDF to planned input_file with low detail", () => {
    const plan = planFutureResponsesRequest(fileInput("application/pdf"));

    expect(plan.documentInput).toMatchObject({
      type: "input_file",
      filename: "synthetic.pdf",
      detail: "low",
      fileData: expect.stringMatching(/^data:application\/pdf;base64,/),
    });
  });

  it("maps an image to planned input_image with configurable detail", () => {
    const plan = planFutureResponsesRequest(fileInput("image/png"), {
      detail: "auto",
    });

    expect(plan.documentInput).toMatchObject({
      type: "input_image",
      detail: "auto",
      imageDataUrl: expect.stringMatching(/^data:image\/png;base64,/),
    });
  });

  it("resolves trusted sample content on the server", () => {
    const plan = planFutureResponsesRequest({
      ...base,
      kind: "sample",
      sampleId: "fictional-residence-renewal-2026",
    });

    expect(plan.documentInput).toMatchObject({
      type: "input_text",
      source: "trusted-sample",
    });
    expect(JSON.stringify(plan.documentInput)).toContain("not government text");
  });
});

function fileInput(
  mimeType: "application/pdf" | "image/png",
): NormalizedCaseInput {
  return {
    ...base,
    kind: "file",
    file: {
      metadata: {
        filename: mimeType === "application/pdf" ? "synthetic.pdf" : "synthetic.png",
        claimedMimeType: mimeType,
        detectedMimeType: mimeType,
        sizeBytes: 4,
      },
      bytes: Uint8Array.from([1, 2, 3, 4]),
    },
  };
}
