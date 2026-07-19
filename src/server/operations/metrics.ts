export type OperationalEndpoint = "analysis" | "research";
export type LatencyBand = "under-1s" | "1s-5s" | "5s-20s" | "over-20s";

export interface OperationalEvent {
  endpoint: OperationalEndpoint;
  outcome: "success" | "failure" | "rate-limited";
  durationMs: number;
  processingMode?: "mock" | "openai" | "curated";
  inputTokens?: number;
  outputTokens?: number;
  retryCount?: number;
  estimatedCostUsd?: number;
}

export interface OperationalMetricsSnapshot {
  requestCount: number;
  successCount: number;
  failureCount: number;
  rateLimitedCount: number;
  retryCount: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  latencyBands: Record<LatencyBand, number>;
}

/** Aggregate-only, in-memory metrics. It accepts no content or identifiers. */
export class OperationalMetricsCollector {
  private requestCount = 0;
  private successCount = 0;
  private failureCount = 0;
  private rateLimitedCount = 0;
  private retryCount = 0;
  private inputTokens = 0;
  private outputTokens = 0;
  private estimatedCostUsd = 0;
  private readonly latencyBands: Record<LatencyBand, number> = {
    "under-1s": 0,
    "1s-5s": 0,
    "5s-20s": 0,
    "over-20s": 0,
  };

  record(event: OperationalEvent): void {
    const durationMs = Math.max(0, event.durationMs);
    this.requestCount += 1;
    this.latencyBands[latencyBand(durationMs)] += 1;
    if (event.outcome === "success") this.successCount += 1;
    else if (event.outcome === "rate-limited") this.rateLimitedCount += 1;
    else this.failureCount += 1;
    this.inputTokens += Math.max(0, event.inputTokens ?? 0);
    this.outputTokens += Math.max(0, event.outputTokens ?? 0);
    this.retryCount += Math.max(0, event.retryCount ?? 0);
    this.estimatedCostUsd += Math.max(0, event.estimatedCostUsd ?? 0);
  }

  snapshot(): OperationalMetricsSnapshot {
    return {
      requestCount: this.requestCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      rateLimitedCount: this.rateLimitedCount,
      retryCount: this.retryCount,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      estimatedCostUsd: Number(this.estimatedCostUsd.toFixed(6)),
      latencyBands: { ...this.latencyBands },
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.rateLimitedCount = 0;
    this.retryCount = 0;
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.estimatedCostUsd = 0;
    for (const band of Object.keys(this.latencyBands) as LatencyBand[]) {
      this.latencyBands[band] = 0;
    }
  }
}

export function latencyBand(durationMs: number): LatencyBand {
  if (durationMs < 1_000) return "under-1s";
  if (durationMs < 5_000) return "1s-5s";
  if (durationMs <= 20_000) return "5s-20s";
  return "over-20s";
}

export const operationalMetrics = new OperationalMetricsCollector();
