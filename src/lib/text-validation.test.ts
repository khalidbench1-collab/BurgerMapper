import { describe, expect, it } from "vitest";

import {
  MAX_PASTED_TEXT_CHARACTERS,
  normalizePastedText,
  validatePastedText,
} from "@/lib/text-validation";

describe("validatePastedText", () => {
  it("rejects blank pasted text", () => {
    expect(validatePastedText("  \n \t ")).toEqual({
      valid: false,
      error: "Paste the letter, email, or official message before continuing.",
    });
  });

  it("rejects fewer than 20 non-whitespace characters", () => {
    expect(validatePastedText("Too short message")).toEqual({
      valid: false,
      error: "Add at least 20 non-whitespace characters so the message is useful.",
    });
  });

  it("accepts useful text and normalizes whitespace", () => {
    const result = validatePastedText(
      "  Official   message\r\nwith enough useful content for this case.  ",
    );

    expect(result).toEqual({
      valid: true,
      normalizedText:
        "Official message\nwith enough useful content for this case.",
    });
  });

  it("rejects text above the 20,000 character limit", () => {
    expect(validatePastedText("a".repeat(MAX_PASTED_TEXT_CHARACTERS + 1))).toEqual({
      valid: false,
      error: "Keep pasted text to 20,000 characters or fewer.",
    });
  });

  it("normalizes repeated blank lines without interpreting content", () => {
    expect(normalizePastedText("One\n\n\n\nTwo")).toBe("One\n\nTwo");
  });
});
