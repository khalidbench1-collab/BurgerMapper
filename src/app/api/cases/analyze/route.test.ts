// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  CASE_FORM_FIELDS,
  type AnalyzeCaseErrorResponse,
  type AnalyzeCaseSuccessResponse,
} from "@/domain/analysis-api";
import { MAX_PASTED_TEXT_CHARACTERS } from "@/lib/text-validation";
import { handleAnalyzeCaseRequest } from "@/server/cases/handle-request";

const SUCCESS_OPTIONS = {
  runtimeConfiguration: {
    mockEnabled: true,
    openAiApiKeyConfigured: false,
  },
  mockDelayMs: 0,
  now: () => new Date("2026-07-18T12:00:00.000Z"),
  createRequestId: () => "request-synthetic-001",
} as const;

describe("POST /api/cases/analyze", () => {
  it("accepts pasted text and returns the CaseAnalysis contract", async () => {
    const privateText =
      "  This   synthetic pasted message has enough useful characters.\r\nSecond line.  ";
    const formData = baseForm("text");
    formData.set(CASE_FORM_FIELDS.text, privateText);
    formData.set(CASE_FORM_FIELDS.category, "arrival-registration");

    const response = await handleAnalyzeCaseRequest(
      createRequest(formData),
      SUCCESS_OPTIONS,
    );
    const payload = (await response.json()) as AnalyzeCaseSuccessResponse;
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.analysis).toMatchObject({
      inputKind: "text",
      category: "arrival-registration",
      outputLanguage: "en",
      isMock: true,
    });
    expect(payload.analysis.nextSteps).toHaveLength(4);
    expect(payload.metadata).toEqual({
      requestId: "request-synthetic-001",
      processingMode: "mock",
      inputKind: "text",
      receivedAt: "2026-07-18T12:00:00.000Z",
      retentionStatus: "discarded-after-processing",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-burgermapper-retention")).toBe(
      "discarded-after-processing",
    );
    expect(serialized).not.toContain(privateText);
    expect(serialized).not.toContain("Second line");
  });

  it("accepts a signature-verified synthetic PDF", async () => {
    const formData = baseForm("file");
    formData.set(
      CASE_FORM_FIELDS.file,
      new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], "safe.pdf", {
        type: "application/pdf",
      }),
    );

    const response = await handleAnalyzeCaseRequest(
      createRequest(formData),
      SUCCESS_OPTIONS,
    );
    const payload = (await response.json()) as AnalyzeCaseSuccessResponse;

    expect(response.status).toBe(200);
    expect(payload.analysis.inputKind).toBe("file");
    expect(JSON.stringify(payload)).not.toContain("safe.pdf");
  });

  it.each([
    ["invalid category", CASE_FORM_FIELDS.category, "unknown", "INVALID_CATEGORY"],
    ["invalid language", CASE_FORM_FIELDS.outputLanguage, "fr", "INVALID_LANGUAGE"],
  ])("returns a typed error for %s", async (_name, field, value, code) => {
    const formData = baseForm("sample");
    formData.set(CASE_FORM_FIELDS.sampleId, "fictional-residence-renewal-2026");
    formData.set(field, value);

    const response = await handleAnalyzeCaseRequest(
      createRequest(formData),
      SUCCESS_OPTIONS,
    );
    const payload = (await response.json()) as AnalyzeCaseErrorResponse;

    expect(response.status).toBe(400);
    expect(payload.error).toMatchObject({ code, requestId: "request-synthetic-001" });
    expect(JSON.stringify(payload)).not.toContain("stack");
  });

  it("rejects an unknown sample without accepting client sample content", async () => {
    const formData = baseForm("sample");
    formData.set(CASE_FORM_FIELDS.sampleId, "unknown-client-sample");
    formData.set(CASE_FORM_FIELDS.text, "Untrusted client sample content must be ignored.");

    const response = await handleAnalyzeCaseRequest(
      createRequest(formData),
      SUCCESS_OPTIONS,
    );
    const payload = (await response.json()) as AnalyzeCaseErrorResponse;

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe("UNKNOWN_SAMPLE");
    expect(JSON.stringify(payload)).not.toContain("Untrusted client sample");
  });

  it.each([
    ["short text", "Too short", "TEXT_TOO_SHORT", 422],
    [
      "long text",
      "x".repeat(MAX_PASTED_TEXT_CHARACTERS + 1),
      "TEXT_TOO_LONG",
      413,
    ],
  ])("rejects %s", async (_name, text, code, status) => {
    const formData = baseForm("text");
    formData.set(CASE_FORM_FIELDS.text, text);

    const response = await handleAnalyzeCaseRequest(
      createRequest(formData),
      SUCCESS_OPTIONS,
    );
    const payload = (await response.json()) as AnalyzeCaseErrorResponse;

    expect(response.status).toBe(status);
    expect(payload.error.code).toBe(code);
    expect(JSON.stringify(payload)).not.toContain(text);
  });

  it("returns API_NOT_CONFIGURED when real mode has no API key", async () => {
    const formData = baseForm("sample");
    formData.set(CASE_FORM_FIELDS.sampleId, "fictional-residence-renewal-2026");

    const response = await handleAnalyzeCaseRequest(createRequest(formData), {
      ...SUCCESS_OPTIONS,
      runtimeConfiguration: {
        mockEnabled: false,
        openAiApiKeyConfigured: false,
      },
    });
    const payload = (await response.json()) as AnalyzeCaseErrorResponse;

    expect(response.status).toBe(503);
    expect(payload.error.code).toBe("API_NOT_CONFIGURED");
    expect(payload.error.message).not.toContain("OPENAI_API_KEY");
  });

  it("rejects a non-multipart request without returning its body", async () => {
    const request = new Request("http://localhost/api/cases/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "private synthetic body" }),
    });

    const response = await handleAnalyzeCaseRequest(request, SUCCESS_OPTIONS);
    const payload = (await response.json()) as AnalyzeCaseErrorResponse;

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_REQUEST");
    expect(JSON.stringify(payload)).not.toContain("private synthetic body");
  });
});

function baseForm(kind: string): FormData {
  const formData = new FormData();
  formData.set(CASE_FORM_FIELDS.kind, kind);
  formData.set(CASE_FORM_FIELDS.outputLanguage, "en");
  return formData;
}

function createRequest(formData: FormData): Request {
  return new Request("http://localhost/api/cases/analyze", {
    method: "POST",
    body: formData,
  });
}
