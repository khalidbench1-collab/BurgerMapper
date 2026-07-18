import { describe, expect, it } from "vitest";

import {
  createFileCaseInput,
  createGoalCaseInput,
  createSampleCaseInput,
  createTextCaseInput,
} from "@/lib/case-input";
import { createUploadedDocument } from "@/lib/file-validation";

describe("normalized CaseInput builders", () => {
  it("creates a normalized goal-only input", () => {
    expect(
      createGoalCaseInput(
        "  Renew   a fictional residence permit. ",
        "en",
        null,
      ),
    ).toEqual({
      valid: true,
      input: {
        kind: "goal",
        goal: "Renew a fictional residence permit.",
        outputLanguage: "en",
      },
    });
  });

  it("creates a normalized discriminated text input", () => {
    const result = createTextCaseInput(
      "  A copied   official message with sufficient useful content. ",
      "de",
      "visa-immigration",
    );

    expect(result).toEqual({
      valid: true,
      input: {
        kind: "text",
        text: "A copied official message with sufficient useful content.",
        category: "visa-immigration",
        outputLanguage: "de",
      },
    });
  });

  it("creates file and sample union members", () => {
    const document = createUploadedDocument(
      new File(["test"], "letter.pdf", { type: "application/pdf" }),
    );

    expect(createFileCaseInput(document, "en", null)).toMatchObject({
      kind: "file",
      document,
      outputLanguage: "en",
    });
    expect(
      createSampleCaseInput("fictional-sample", "ar", "family-children"),
    ).toEqual({
      kind: "sample",
      sampleId: "fictional-sample",
      category: "family-children",
      outputLanguage: "ar",
    });
  });

  it("adds one normalized goal to existing evidence inputs", () => {
    const result = createTextCaseInput(
      "A copied official message with sufficient useful content.",
      "en",
      null,
      "  Work out   which step comes first. ",
    );

    expect(result).toMatchObject({
      valid: true,
      input: {
        kind: "text",
        goal: "Work out which step comes first.",
      },
    });
  });
});
