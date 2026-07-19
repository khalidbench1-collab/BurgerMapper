import { createHash, randomBytes } from "node:crypto";

export type GuardFailure = "rate-limit" | "concurrency-limit";

export interface RequestGuardLease {
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number;
  release(): void;
}

export interface RequestGuardDecision {
  ok: boolean;
  failure?: GuardFailure;
  retryAfterSeconds: number;
  lease?: RequestGuardLease;
}

export interface RequestGuard {
  acquire(request: Request, now?: number): RequestGuardDecision;
}

interface ClientWindow {
  count: number;
  resetAt: number;
  active: number;
}

/**
 * A deliberately small, process-local guard for the anonymous MVP. Client
 * addresses are salted and hashed in memory and are never logged or returned.
 * Multi-instance deployments must replace this with shared edge protection.
 */
export class InMemoryRequestGuard implements RequestGuard {
  private readonly clients = new Map<string, ClientWindow>();
  private readonly salt = randomBytes(32);
  private activeRequests = 0;

  constructor(
    private readonly options: {
      maxRequests: number;
      windowMs: number;
      maxConcurrent: number;
      maxTrackedClients?: number;
    },
  ) {}

  acquire(request: Request, now = Date.now()): RequestGuardDecision {
    this.pruneExpiredClients(now);
    const key = this.clientKey(request);
    const current = this.clients.get(key);
    const state = !current || current.resetAt <= now
      ? { count: 0, active: current?.active ?? 0, resetAt: now + this.options.windowMs }
      : current;

    if (this.activeRequests >= this.options.maxConcurrent) {
      return {
        ok: false,
        failure: "concurrency-limit",
        retryAfterSeconds: 1,
      };
    }
    if (state.count >= this.options.maxRequests) {
      return {
        ok: false,
        failure: "rate-limit",
        retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1_000)),
      };
    }

    state.count += 1;
    state.active += 1;
    this.activeRequests += 1;
    if (!current) this.ensureClientCapacity();
    this.clients.set(key, state);
    let released = false;
    return {
      ok: true,
      retryAfterSeconds: 0,
      lease: {
        limit: this.options.maxRequests,
        remaining: Math.max(0, this.options.maxRequests - state.count),
        resetAt: state.resetAt,
        release: () => {
          if (released) return;
          released = true;
          state.active = Math.max(0, state.active - 1);
          this.activeRequests = Math.max(0, this.activeRequests - 1);
        },
      },
    };
  }

  private pruneExpiredClients(now: number): void {
    for (const [key, state] of this.clients) {
      if (state.resetAt <= now && state.active === 0) this.clients.delete(key);
    }
  }

  private ensureClientCapacity(): void {
    const maxTrackedClients = this.options.maxTrackedClients ?? 2_048;
    if (this.clients.size < maxTrackedClients) return;
    for (const [key, state] of this.clients) {
      if (state.active === 0) {
        this.clients.delete(key);
        return;
      }
    }
    const oldestKey = this.clients.keys().next().value;
    if (oldestKey) this.clients.delete(oldestKey);
  }

  private clientKey(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const candidate = forwarded || request.headers.get("x-real-ip")?.trim() || "anonymous-client";
    return createHash("sha256").update(this.salt).update(candidate).digest("hex");
  }
}

export const analysisRequestGuard = new InMemoryRequestGuard({
  maxRequests: 20,
  windowMs: 60_000,
  maxConcurrent: 2,
});

export const researchRequestGuard = new InMemoryRequestGuard({
  maxRequests: 30,
  windowMs: 60_000,
  maxConcurrent: 3,
});
