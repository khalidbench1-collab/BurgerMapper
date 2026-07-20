import OpenAI from "openai";

import type { CaseAnalysis, ClarificationQuestion } from "@/domain/case";
import type { CaseProfile, CaseProfileField } from "@/domain/case-profile";
import { CaseRequestError } from "@/server/cases/errors";
import { MAX_CLARIFICATION_QUESTIONS, MAX_PROVIDER_REQUESTS_PER_CASE, OPENAI_REQUEST_TIMEOUT_MS } from "@/server/cases/openai/config";
import { buildInitialOpenAIRequest, buildVerificationOpenAIRequest, type PlannedOpenAIRequest } from "@/server/cases/openai/request";
import { ModelCaseOutputSchema, ModelVerificationOutputSchema, type ModelCaseOutput } from "@/server/cases/openai/schemas";
import type { NormalizedCaseInput } from "@/server/cases/types";
import { estimateLunaCostUsd } from "@/server/operations/cost";

export interface OpenAITransportResult {
  outputParsed: unknown;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface OpenAIResponsesTransport {
  parse(request: PlannedOpenAIRequest, signal?: AbortSignal): Promise<OpenAITransportResult>;
}

export interface OpenAICaseProviderOptions {
  apiKey: string;
  model: string;
  transport?: OpenAIResponsesTransport;
  requestNumber?: number;
}

export interface ProviderCaseResult {
  analysis: CaseAnalysis;
  profile?: CaseProfile;
  processingMode: "mock" | "openai";
  operationalUsage?: {
    inputTokens: number;
    outputTokens: number;
    retryCount: number;
    verificationCount: number;
    estimatedCostUsd: number;
  };
}

const ALLOWED_VERIFICATION_TRIGGERS = new Set([
  "high-risk",
  "source-conflict",
  "unsupported-claim",
  "failed-validation",
]);

export class OpenAICaseBuilderProvider {
  private readonly transport: OpenAIResponsesTransport;

  constructor(private readonly options: OpenAICaseProviderOptions) {
    if (!options.apiKey.trim()) throw new CaseRequestError("API_NOT_CONFIGURED", 503);
    this.transport = options.transport ?? createOpenAITransport(options.apiKey);
  }

  async analyze(input: NormalizedCaseInput, signal?: AbortSignal): Promise<ProviderCaseResult> {
    const requestNumber = this.options.requestNumber ?? 1;
    if (requestNumber > MAX_PROVIDER_REQUESTS_PER_CASE) {
      throw new CaseRequestError("REQUEST_LIMIT_REACHED", 429);
    }

    const primary = await executeWithBoundedRetry(
      () => this.transport.parse(buildInitialOpenAIRequest(input, this.options.model), signal),
      signal,
    );
    let parsed = ModelCaseOutputSchema.safeParse(primary.result.outputParsed);
    let verificationCount = 0;
    let retryCount = primary.retryCount;
    let inputTokens = primary.result.usage?.inputTokens ?? 0;
    let outputTokens = primary.result.usage?.outputTokens ?? 0;

    if (!parsed.success) {
      const verification = await executeWithBoundedRetry(
        () => this.transport.parse(buildVerificationOpenAIRequest(primary.result.outputParsed, this.options.model, "failed-validation"), signal),
        signal,
      );
      verificationCount = 1;
      retryCount += verification.retryCount;
      inputTokens += verification.result.usage?.inputTokens ?? 0;
      outputTokens += verification.result.usage?.outputTokens ?? 0;
      const verified = ModelVerificationOutputSchema.safeParse(verification.result.outputParsed);
      // The primary output never parsed, so there is nothing safe to fall back to.
      if (!verified.success) throw new CaseRequestError("PROVIDER_RESPONSE_INVALID", 502);
      parsed = ModelCaseOutputSchema.safeParse(verified.data.correctedOutput);
    } else if (shouldRunVerification(parsed.data)) {
      const verification = await executeWithBoundedRetry(
        () => this.transport.parse(buildVerificationOpenAIRequest(parsed.data, this.options.model), signal),
        signal,
      );
      verificationCount = 1;
      retryCount += verification.retryCount;
      inputTokens += verification.result.usage?.inputTokens ?? 0;
      outputTokens += verification.result.usage?.outputTokens ?? 0;
      // Verification is a quality pass over an output that already satisfied the
      // strict schema. If the check itself comes back unusable, keep the verified-
      // by-schema primary result instead of failing the whole case.
      const verified = ModelVerificationOutputSchema.safeParse(verification.result.outputParsed);
      if (verified.success) {
        const corrected = ModelCaseOutputSchema.safeParse(verified.data.correctedOutput);
        if (corrected.success) parsed = corrected;
      }
    }

    if (!parsed.success || !isCoherentOutput(parsed.data)) {
      throw new CaseRequestError("PROVIDER_RESPONSE_INVALID", 502);
    }
    const artifacts = toCaseArtifacts(parsed.data, input);
    return {
      ...artifacts,
      processingMode: "openai",
      operationalUsage: {
        inputTokens,
        outputTokens,
        retryCount,
        verificationCount,
        estimatedCostUsd: estimateLunaCostUsd(inputTokens, outputTokens),
      },
    };
  }
}

export function shouldRunVerification(output: ModelCaseOutput): boolean {
  return output.verification.required && ALLOWED_VERIFICATION_TRIGGERS.has(output.verification.trigger);
}

function createOpenAITransport(apiKey: string): OpenAIResponsesTransport {
  const client = new OpenAI({ apiKey, timeout: OPENAI_REQUEST_TIMEOUT_MS, maxRetries: 0 });
  return {
    async parse(request, signal) {
      const response = await client.responses.parse(
        request as Parameters<typeof client.responses.parse>[0],
        { signal },
      );
      return {
        outputParsed: response.output_parsed,
        usage: response.usage ? {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        } : undefined,
      };
    },
  };
}

async function executeWithBoundedRetry(
  operation: () => Promise<OpenAITransportResult>,
  signal?: AbortSignal,
): Promise<{ result: OpenAITransportResult; retryCount: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    if (signal?.aborted) throw new CaseRequestError("PROVIDER_UNAVAILABLE", 503);
    try {
      return { result: await operation(), retryCount: attempt - 1 };
    } catch (error) {
      lastError = error;
      if (attempt === 2 || !isTransientProviderError(error)) break;
      await abortableDelay(120 * attempt, signal);
    }
  }
  throw mapProviderError(lastError);
}

function isTransientProviderError(error: unknown): boolean {
  const status = readErrorStatus(error);
  const code = readErrorCode(error);
  if (code === "insufficient_quota" || code === "billing_hard_limit_reached") return false;
  return status === 408 || status === 409 || status === 429 || (status !== null && status >= 500);
}

function mapProviderError(error: unknown): CaseRequestError {
  if (error instanceof CaseRequestError) return error;
  const status = readErrorStatus(error);
  const code = readErrorCode(error);
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (name === "APITimeoutError" || name === "APIConnectionTimeoutError" || status === 408 || message.includes("timed out")) {
    return new CaseRequestError("PROVIDER_TIMEOUT", 504);
  }
  if (status === 401 || status === 403) return new CaseRequestError("PROVIDER_AUTH_ERROR", 503);
  if (code === "insufficient_quota" || code === "billing_hard_limit_reached") return new CaseRequestError("PROVIDER_BILLING_ERROR", 503);
  if (status === 429) return new CaseRequestError("PROVIDER_RATE_LIMITED", 429);
  return new CaseRequestError("PROVIDER_UNAVAILABLE", 503);
}

function readErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("status" in error)) return null;
  return typeof error.status === "number" ? error.status : null;
}

function readErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

function abortableDelay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new CaseRequestError("PROVIDER_UNAVAILABLE", 503));
    }, { once: true });
  });
}

function isCoherentOutput(output: ModelCaseOutput): boolean {
  if (output.clarification.needed !== Boolean(output.clarification.question)) return false;
  if (output.clarification.question) {
    const ids = output.clarification.question.options.map((option) => option.id);
    if (new Set(ids).size !== ids.length) return false;
  }
  const orders = output.nextSteps.map((step) => step.order);
  return new Set(orders).size === orders.length;
}

function toCaseArtifacts(rawOutput: ModelCaseOutput, input: NormalizedCaseInput): { analysis: CaseAnalysis; profile: CaseProfile } {
  // The model can keep finding "one more" consequential detail. Cap the exchange
  // deterministically so the user always reaches a route instead of looping.
  const answeredCount = input.clarificationResolution
    ? (input.clarificationResolution.answerHistory?.length ?? 0) + 1
    : 0;
  const cappedOutput: ModelCaseOutput = answeredCount >= MAX_CLARIFICATION_QUESTIONS
    ? {
        ...rawOutput,
        clarification: {
          ...rawOutput.clarification,
          needed: false,
          question: null,
          sufficiencyReason: "Enough detail has been gathered to finalize the route. Any remaining uncertainty is listed as an open point rather than another question.",
        },
      }
    : rawOutput;
  // Once the route is final there is no pending question, so a step must not
  // tell the user it "needs your answer" — nothing is waiting on them here.
  const output: ModelCaseOutput = cappedOutput.clarification.needed
    ? cappedOutput
    : {
        ...cappedOutput,
        nextSteps: cappedOutput.nextSteps.map((step) =>
          step.status === "needs-answer" ? { ...step, status: "ready" as const } : step),
      };
  const question = toClarificationQuestion(output, input);
  const profileId = `profile-openai-${input.receivedAt}`;
  const analysis: CaseAnalysis = {
    id: `analysis-openai-${input.receivedAt}`,
    documentTitle: output.document.title,
    issuingAuthority: output.document.issuingAuthority,
    documentType: output.document.documentType,
    documentLanguage: output.document.documentLanguage,
    detectedDate: output.document.detectedDate,
    detectedDeadline: output.document.detectedDeadline,
    urgency: output.urgency,
    summary: output.interpretation.summary,
    whatTheAuthorityWants: output.interpretation.whatTheAuthorityWants,
    requiredDocuments: output.requiredDocuments,
    missingInformation: output.interpretation.missingInformation,
    clarificationQuestion: question,
    nextSteps: output.nextSteps.map((step) => ({ ...step, officialSourceIds: [] })),
    officialSources: [],
    disclaimer: output.disclaimer,
    generatedAt: input.receivedAt,
    outputLanguage: input.outputLanguage,
    inputKind: input.kind,
    category: input.category,
    mockContext: "OpenAI interpreted the supplied case content. Official sources have not yet been researched or verified.",
  };
  const knownFacts: CaseProfileField[] = output.profileFacts;
  const profile: CaseProfile = {
    id: profileId,
    goal: {
      text: output.profileGoal,
      source: input.normalizedGoal ? "user" : "model-interpretation",
    },
    category: input.category,
    evidence: evidenceFromInput(input),
    knownFacts,
    answers: input.clarificationResolution ? [
      ...(input.clarificationResolution.answerHistory ?? []).map((entry) => ({
        questionId: entry.questionId,
        answerId: entry.questionId,
        label: entry.answerLabel,
        routeImpact: "An earlier answer that remains part of the case profile.",
        answeredAt: input.receivedAt,
      })),
      {
        questionId: input.clarificationResolution.questionId,
        answerId: input.clarificationResolution.answerId,
        label: input.clarificationResolution.answerLabel,
        routeImpact: "The model rebuilt the structured profile and route using this answer.",
        answeredAt: input.receivedAt,
      },
    ] : [],
    uncertainties: output.profileUncertainties.map((item) => ({ ...item, status: "unresolved" })),
    outputLanguage: input.outputLanguage,
    sufficiency: {
      state: output.clarification.needed ? "needs-clarification" : "sufficient",
      reason: output.clarification.sufficiencyReason,
      nextQuestionId: output.clarification.question?.id ?? null,
    },
    askedQuestionIds: Array.from(new Set([
      ...(input.clarificationResolution?.answerHistory ?? []).map((entry) => entry.questionId),
      ...(input.clarificationResolution ? [input.clarificationResolution.questionId] : []),
      ...(output.clarification.question ? [output.clarification.question.id] : []),
    ])),
    correctionHistory: [],
    status: output.clarification.needed ? "building" : "route-ready",
    createdAt: input.receivedAt,
    updatedAt: input.receivedAt,
  };
  return { analysis, profile };
}

function toClarificationQuestion(output: ModelCaseOutput, input: NormalizedCaseInput): ClarificationQuestion {
  if (output.clarification.question) {
    return { ...output.clarification.question, selectedAnswerId: null };
  }
  if (input.clarificationResolution) {
    return {
      id: input.clarificationResolution.questionId,
      prompt: input.clarificationResolution.questionPrompt,
      reason: input.clarificationResolution.questionReason,
      options: input.clarificationResolution.options,
      selectedAnswerId: input.clarificationResolution.answerId,
    };
  }
  return {
    id: "no-clarification-needed",
    prompt: "No further question is needed.",
    reason: output.clarification.sufficiencyReason,
    options: [{ id: "dont-know", label: "I don't know", routeImpact: "No route change." }],
    selectedAnswerId: null,
  };
}

function evidenceFromInput(input: NormalizedCaseInput): CaseProfile["evidence"] {
  if (input.kind === "goal") return [];
  if (input.kind === "text") return [{ kind: "text", label: "Pasted official message", contentRetained: false }];
  if (input.kind === "sample") return [{ kind: "sample", label: "Trusted fictional residence-renewal sample", contentRetained: false }];
  return [{
    kind: "file",
    label: input.file.metadata.detectedMimeType === "application/pdf" ? "Uploaded PDF document" : "Uploaded image document",
    mimeType: input.file.metadata.detectedMimeType,
    sizeBytes: input.file.metadata.sizeBytes,
    contentRetained: false,
  }];
}
