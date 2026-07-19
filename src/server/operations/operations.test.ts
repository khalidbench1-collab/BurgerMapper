// @vitest-environment node

import { describe, expect, it } from "vitest";

import { estimateLunaCostUsd } from "@/server/operations/cost";
import { OperationalMetricsCollector } from "@/server/operations/metrics";
import { InMemoryRequestGuard } from "@/server/operations/request-guard";

describe("anonymous operational controls", () => {
  it("enforces endpoint-wide request and concurrency limits without returning a client identifier", () => {
    const guard = new InMemoryRequestGuard({ maxRequests: 2, windowMs: 60_000, maxConcurrent: 1 });
    const request = new Request("http://localhost/api/cases/analyze", { headers: { "x-forwarded-for": "192.0.2.1" } });
    const first = guard.acquire(request, 1_000);
    expect(first).toMatchObject({ ok: true, retryAfterSeconds: 0 });
    expect(first).not.toHaveProperty("clientKey");
    const anotherClient = new Request("http://localhost/api/cases/analyze", { headers: { "x-forwarded-for": "192.0.2.2" } });
    expect(guard.acquire(anotherClient, 1_001)).toMatchObject({ ok: false, failure: "concurrency-limit" });
    first.lease?.release();
    const second = guard.acquire(request, 1_002);
    expect(second.ok).toBe(true);
    second.lease?.release();
    expect(guard.acquire(request, 1_003)).toMatchObject({ ok: false, failure: "rate-limit" });
  });

  it("stores content-free aggregate metrics only", () => {
    const metrics = new OperationalMetricsCollector();
    metrics.record({ endpoint: "analysis", outcome: "success", durationMs: 900, processingMode: "openai", inputTokens: 1_000, outputTokens: 500, retryCount: 1, estimatedCostUsd: 0.004 });
    metrics.record({ endpoint: "research", outcome: "rate-limited", durationMs: 0 });
    expect(metrics.snapshot()).toMatchObject({ requestCount: 2, successCount: 1, rateLimitedCount: 1, retryCount: 1, inputTokens: 1_000, outputTokens: 500, estimatedCostUsd: 0.004 });
    expect(JSON.stringify(metrics.snapshot())).not.toContain("prompt");
  });

  it("uses the verified Luna token prices for conservative cost estimates", () => {
    expect(estimateLunaCostUsd(1_000_000, 1_000_000)).toBe(7);
    expect(estimateLunaCostUsd(1_000_000, 0, 500_000)).toBe(0.55);
  });
});
