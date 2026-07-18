import { describe, expect, it } from "vitest";

import {
  MAX_FILE_SIZE_BYTES,
  validateDocumentFile,
} from "@/lib/file-validation";

describe("validateDocumentFile", () => {
  it.each([
    ["letter.pdf", "application/pdf"],
    ["letter.png", "image/png"],
    ["letter.jpg", "image/jpeg"],
    ["letter.webp", "image/webp"],
  ])("accepts %s", (name, type) => {
    const file = new File(["safe test bytes"], name, { type });

    expect(validateDocumentFile(file)).toEqual({ valid: true });
  });

  it("rejects an unsupported file type", () => {
    const file = new File(["test"], "letter.txt", { type: "text/plain" });

    expect(validateDocumentFile(file)).toEqual({
      valid: false,
      error: "Choose a PDF, PNG, JPEG, or WebP document.",
    });
  });

  it("rejects a file larger than 10 MB", () => {
    const file = new File(["test"], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: MAX_FILE_SIZE_BYTES + 1 });

    expect(validateDocumentFile(file)).toEqual({
      valid: false,
      error: "This file is larger than 10 MB. Choose a smaller document.",
    });
  });
});
