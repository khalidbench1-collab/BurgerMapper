// @vitest-environment node

import { describe, expect, it } from "vitest";

import { CASE_FORM_FIELDS } from "@/domain/analysis-api";
import { MAX_FILE_SIZE_BYTES } from "@/lib/file-validation";
import { CaseRequestError } from "@/server/cases/errors";
import {
  detectFileMimeType,
  normalizeAnalyzeCaseFormData,
} from "@/server/cases/validate-request";

const SIGNATURES = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/jpeg": [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10],
  "image/webp": [
    0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
    0x50,
  ],
} as const;

describe("server file validation", () => {
  it.each(Object.entries(SIGNATURES))(
    "detects a valid %s signature",
    (mimeType, signature) => {
      expect(detectFileMimeType(Uint8Array.from(signature))).toBe(mimeType);
    },
  );

  it("rejects a mismatch between claimed type and magic bytes", async () => {
    const formData = fileForm(
      new File([Uint8Array.from(SIGNATURES["image/png"])], "letter.pdf", {
        type: "application/pdf",
      }),
    );

    await expect(normalizeAnalyzeCaseFormData(formData, now())).rejects.toMatchObject({
      code: "FILE_SIGNATURE_MISMATCH",
    });
  });

  it("rejects an empty file", async () => {
    const formData = fileForm(
      new File([], "empty.pdf", { type: "application/pdf" }),
    );

    await expect(normalizeAnalyzeCaseFormData(formData, now())).rejects.toMatchObject({
      code: "FILE_EMPTY",
    });
  });

  it("rejects an oversized file before reading its bytes", async () => {
    const file = new File(
      [new Uint8Array(MAX_FILE_SIZE_BYTES + 1)],
      "oversized.pdf",
      { type: "application/pdf" },
    );

    await expect(
      normalizeAnalyzeCaseFormData(fileForm(file), now()),
    ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
  });

  it("normalizes pasted text on the server", async () => {
    const formData = baseForm("text");
    formData.set(
      CASE_FORM_FIELDS.text,
      "  Fictional   official\r\nmessage with enough useful characters.  ",
    );

    await expect(normalizeAnalyzeCaseFormData(formData, now())).resolves.toMatchObject({
      kind: "text",
      normalizedText: "Fictional official\nmessage with enough useful characters.",
    });
  });

  it.each([
    ["category", "not-a-category", "INVALID_CATEGORY"],
    ["language", "fr", "INVALID_LANGUAGE"],
  ])("rejects invalid %s", async (field, value, expectedCode) => {
    const formData = baseForm("sample");
    formData.set(CASE_FORM_FIELDS.sampleId, "fictional-residence-renewal-2026");
    formData.set(
      field === "category"
        ? CASE_FORM_FIELDS.category
        : CASE_FORM_FIELDS.outputLanguage,
      value,
    );

    try {
      await normalizeAnalyzeCaseFormData(formData, now());
      throw new Error("Expected request validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(CaseRequestError);
      expect(error).toMatchObject({ code: expectedCode });
    }
  });

  it("rejects an unknown sample identifier", async () => {
    const formData = baseForm("sample");
    formData.set(CASE_FORM_FIELDS.sampleId, "client-supplied-sample");

    await expect(normalizeAnalyzeCaseFormData(formData, now())).rejects.toMatchObject({
      code: "UNKNOWN_SAMPLE",
    });
  });
});

function baseForm(kind: string): FormData {
  const formData = new FormData();
  formData.set(CASE_FORM_FIELDS.kind, kind);
  formData.set(CASE_FORM_FIELDS.outputLanguage, "en");
  return formData;
}

function fileForm(file: File): FormData {
  const formData = baseForm("file");
  formData.set(CASE_FORM_FIELDS.file, file, file.name);
  return formData;
}

function now(): string {
  return "2026-07-18T12:00:00.000Z";
}
