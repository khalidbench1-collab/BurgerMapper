import { describe, expect, it } from "vitest";

import { handleResearchCaseRequest } from "@/server/research/handle-request";
import { InMemoryRequestGuard } from "@/server/operations/request-guard";

const URL = "http://localhost/api/cases/research";
const OPTIONS = {
  now: () => new Date("2026-07-18T18:00:00.000Z"),
  createRequestId: () => "research-request-001",
};

function request(body: unknown) {
  return new Request(URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

describe("POST /api/cases/research", () => {
  it("returns cited official research only for a sufficient abstract profile", async () => {
    const response = await handleResearchCaseRequest(request({ topic: "residence-permit-renewal", category: "visa-immigration", outputLanguage: "en", profileSufficiency: "sufficient" }), OPTIONS);
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.research.sources[0].url).toMatch(/^https:\/\/(www\.berlin\.de|www\.gesetze-im-internet\.de)/);
    expect(payload.research.claims[0].sourceIds.length).toBeGreaterThan(0);
    expect(payload.metadata).toMatchObject({ retentionStatus: "discarded-after-processing", inputScope: "abstract-route-topic-only" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects an insufficient profile with a typed safe error", async () => {
    const response = await handleResearchCaseRequest(request({ topic: "residence-permit-renewal", category: null, outputLanguage: "en", profileSufficiency: "needs-clarification" }), OPTIONS);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: { code: "PROFILE_NOT_SUFFICIENT", message: "Answer the route-changing question before official-source research begins.", requestId: "research-request-001" } });
  });

  it.each([
    [{ topic: "arbitrary", category: null, outputLanguage: "en", profileSufficiency: "sufficient" }, "INVALID_TOPIC"],
    [{ topic: "unsupported", category: "not-a-category", outputLanguage: "en", profileSufficiency: "sufficient" }, "INVALID_CATEGORY"],
    [{ topic: "unsupported", category: null, outputLanguage: "fr", profileSufficiency: "sufficient" }, "INVALID_LANGUAGE"],
  ])("rejects invalid public request values", async (body, code) => {
    const response = await handleResearchCaseRequest(request(body), OPTIONS);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe(code);
  });

  it("rejects private case fields and never echoes them", async () => {
    const privateMarker = "SYNTHETIC_PRIVATE_REFERENCE_123";
    const response = await handleResearchCaseRequest(request({ topic: "unsupported", category: null, outputLanguage: "en", profileSufficiency: "sufficient", goal: privateMarker }), OPTIONS);
    const text = await response.text();
    expect(response.status).toBe(400);
    expect(text).not.toContain(privateMarker);
    expect(text).not.toContain("goal");
  });

  it("returns an honest no-source result for unsupported categories", async () => {
    const response = await handleResearchCaseRequest(request({ topic: "unsupported", category: "health-insurance", outputLanguage: "en", profileSufficiency: "sufficient" }), OPTIONS);
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.research.summary.status).toBe("no-sources");
    expect(payload.research.sources).toEqual([]);
    expect(payload.research.summary.escalation).toBeTruthy();
  });

  it("maps a retriever outage to a typed fallback without exposing internals", async () => {
    const response = await handleResearchCaseRequest(
      request({ topic: "address-registration", category: "arrival-registration", outputLanguage: "en", profileSufficiency: "sufficient" }),
      { ...OPTIONS, retriever: { retrieve: async () => { throw new Error("private source failure"); } } },
    );
    const text = await response.text();
    expect(response.status).toBe(503);
    expect(JSON.parse(text).error.code).toBe("RESEARCH_UNAVAILABLE");
    expect(text).not.toContain("private source failure");
  });

  it("rate-limits research with a safe typed response", async () => {
    const guard = new InMemoryRequestGuard({ maxRequests: 1, windowMs: 60_000, maxConcurrent: 1 });
    const body = { topic: "unsupported", category: null, outputLanguage: "en", profileSufficiency: "sufficient" };
    expect((await handleResearchCaseRequest(request(body), { ...OPTIONS, requestGuard: guard })).status).toBe(200);
    const response = await handleResearchCaseRequest(request(body), { ...OPTIONS, requestGuard: guard });
    expect(response.status).toBe(429);
    expect((await response.json()).error.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});
