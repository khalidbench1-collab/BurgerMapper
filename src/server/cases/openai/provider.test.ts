// @vitest-environment node

import { describe, expect, it } from "vitest";

import { MAX_PROVIDER_REQUESTS_PER_CASE, REASONING_BY_TASK } from "@/server/cases/openai/config";
import { OpenAICaseBuilderProvider, shouldRunVerification, type OpenAIResponsesTransport } from "@/server/cases/openai/provider";
import { buildInitialOpenAIRequest } from "@/server/cases/openai/request";
import { OPENAI_CASE_BUILDER_INSTRUCTION } from "@/server/cases/openai/prompts";
import type { ModelCaseOutput } from "@/server/cases/openai/schemas";
import type { NormalizedCaseInput, SupportedFileMimeType } from "@/server/cases/types";
import { readAnalysisRuntimeConfiguration, runConfiguredAnalysis } from "@/server/cases/provider";

const VALID_OUTPUT: ModelCaseOutput = {
  profileGoal: "Renew a fictional residence permit.",
  document: {
    title: "Request for additional documents",
    issuingAuthority: "Landesamt für Einwanderung Berlin",
    documentType: "Residence permit renewal request",
    documentLanguage: "German",
    detectedDate: "2026-07-01",
    detectedDeadline: "2026-07-15",
  },
  interpretation: {
    summary: "The authority requests additional documents for a fictional renewal.",
    whatTheAuthorityWants: "Submit the listed documents before the detected deadline.",
    missingInformation: ["Employment status still changes the income evidence."],
  },
  urgency: "high",
  requiredDocuments: [{ id: "passport", title: "Passport copy", description: "Copy of the current passport.", status: "required" }],
  clarification: {
    needed: true,
    sufficiencyReason: "Employment status changes the evidence route.",
    question: {
      id: "employment-status",
      prompt: "Are you employed, self-employed, or both?",
      reason: "This changes the income evidence to prepare.",
      options: [
        { id: "employed", label: "Employed", routeImpact: "Prepare payslips." },
        { id: "self-employed", label: "Self-employed", routeImpact: "Prepare business records." },
        { id: "dont-know", label: "I don't know", routeImpact: "Add a verification step." },
      ],
    },
  },
  nextSteps: [{ order: 1, title: "Prepare documents", description: "Collect the listed items.", responsibleParty: "You", timing: "Before the deadline", status: "needs-answer" }],
  profileFacts: [{ id: "authority", label: "Issuing authority", value: "Landesamt für Einwanderung Berlin", source: "document" }],
  profileUncertainties: [{ id: "employment", description: "Employment status is not yet known." }],
  disclaimer: "This is general legal information, not legal advice. Verify changing requirements with official sources.",
  verification: { required: false, trigger: "none", reasons: [] },
};

class SequenceTransport implements OpenAIResponsesTransport {
  readonly requests: Array<Parameters<OpenAIResponsesTransport["parse"]>[0]> = [];
  constructor(private readonly sequence: Array<unknown | Error>) {}
  async parse(request: Parameters<OpenAIResponsesTransport["parse"]>[0]) {
    this.requests.push(request);
    const next = this.sequence.shift();
    if (next instanceof Error) throw next;
    if (next && typeof next === "object" && "throwValue" in next) throw (next as { throwValue: unknown }).throwValue;
    return { outputParsed: next };
  }
}

describe("OpenAICaseBuilderProvider", () => {
  it("accepts a strict structured result and creates real CaseAnalysis and CaseProfile contracts", async () => {
    const transport = new SequenceTransport([VALID_OUTPUT]);
    const result = await provider(transport).analyze(goalInput());

    expect(result.processingMode).toBe("openai");
    expect(result.analysis).toMatchObject({ inputKind: "goal", officialSources: [] });
    expect(result.profile).toMatchObject({ status: "building", sufficiency: { state: "needs-clarification" } });
    expect(transport.requests).toHaveLength(1);
  });

  it("supports a sufficient profile without inventing another visible question", async () => {
    const output = structuredClone(VALID_OUTPUT);
    output.clarification = { needed: false, question: null, sufficiencyReason: "The profile is sufficient." };
    output.nextSteps[0].status = "ready";
    const result = await provider(new SequenceTransport([output])).analyze(goalInput());

    expect(result.profile?.sufficiency).toMatchObject({ state: "sufficient", nextQuestionId: null });
    expect(result.profile?.status).toBe("route-ready");
  });

  it("preserves the answered question so a real-mode correction can rebuild the route", async () => {
    const output = structuredClone(VALID_OUTPUT);
    output.clarification = { needed: false, question: null, sufficiencyReason: "The answer made the profile sufficient." };
    output.nextSteps[0].status = "ready";
    const input = goalInput();
    input.clarificationResolution = {
      questionId: "employment-status",
      questionPrompt: "Are you employed, self-employed, or both?",
      questionReason: "The answer changes evidence.",
      answerId: "employed",
      answerLabel: "Employed",
      options: VALID_OUTPUT.clarification.question!.options,
    };
    const result = await provider(new SequenceTransport([output])).analyze(input);
    expect(result.analysis.clarificationQuestion).toMatchObject({ id: "employment-status", selectedAnswerId: "employed" });
    expect(result.profile?.answers[0]).toMatchObject({ questionId: "employment-status", answerId: "employed" });
  });

  it("stops asking once the clarification cap is reached even if the model wants another question", async () => {
    const input = goalInput();
    input.clarificationResolution = {
      questionId: "permit-status",
      questionPrompt: "Is your permit still valid?",
      questionReason: "The answer changes urgency.",
      answerId: "still-valid",
      answerLabel: "It is still valid",
      options: VALID_OUTPUT.clarification.question!.options,
      answerHistory: [
        { questionId: "permit-expiry", questionPrompt: "When does it expire?", answerLabel: "2026-11-30" },
        { questionId: "activity-wording", questionPrompt: "What wording is on the permit?", answerLabel: "Freiberufliche Tätigkeit" },
      ],
    };
    // VALID_OUTPUT still carries clarification.needed = true with a question.
    const result = await provider(new SequenceTransport([VALID_OUTPUT])).analyze(input);

    expect(result.profile?.sufficiency).toMatchObject({ state: "sufficient", nextQuestionId: null });
    expect(result.profile?.status).toBe("route-ready");
    expect(result.profile?.answers.map((answer) => answer.label)).toEqual([
      "2026-11-30",
      "Freiberufliche Tätigkeit",
      "It is still valid",
    ]);
  });

  it("carries every earlier answer into the prompt so the model cannot repeat a question", () => {
    const input = goalInput();
    input.clarificationResolution = {
      questionId: "permit-status",
      questionPrompt: "Is your permit still valid?",
      questionReason: "The answer changes urgency.",
      answerId: "still-valid",
      answerLabel: "It is still valid",
      options: VALID_OUTPUT.clarification.question!.options,
      answerHistory: [
        { questionId: "permit-expiry", questionPrompt: "When does it expire?", answerLabel: "2026-11-30" },
      ],
    };
    const serialized = JSON.stringify(buildInitialOpenAIRequest(input, "gpt-5.6-luna").input);
    expect(serialized).toContain("When does it expire?");
    expect(serialized).toContain("2026-11-30");
    expect(serialized).toContain("never ask any of these again");
  });

  it("clears needs-answer step status once the route is final so no step implies a pending question", async () => {
    const output = structuredClone(VALID_OUTPUT);
    output.clarification = { needed: false, question: null, sufficiencyReason: "The profile is sufficient." };
    output.nextSteps[0].status = "needs-answer";
    const result = await provider(new SequenceTransport([output])).analyze(goalInput());

    expect(result.analysis.nextSteps.map((step) => step.status)).not.toContain("needs-answer");
  });

  it("keeps needs-answer while a question is still open", async () => {
    const output = structuredClone(VALID_OUTPUT);
    output.nextSteps[0].status = "needs-answer";
    const result = await provider(new SequenceTransport([output])).analyze(goalInput());

    expect(result.analysis.nextSteps[0].status).toBe("needs-answer");
  });

  it("tells the model how much question budget remains so it neither loops nor finalizes early", () => {
    const fresh = JSON.stringify(buildInitialOpenAIRequest(goalInput(), "gpt-5.6-luna").input);
    expect(fresh).toContain("you have asked 0 of 3 allowed questions");
    expect(fresh).toContain("While budget remains, spend it");

    const input = goalInput();
    input.clarificationResolution = {
      questionId: "citizenship",
      questionPrompt: "Are you an EU citizen?",
      questionReason: "It changes the route.",
      answerId: "non-eu",
      answerLabel: "No, I hold a German residence permit",
      options: VALID_OUTPUT.clarification.question!.options,
      answerHistory: [
        { questionId: "a", questionPrompt: "First?", answerLabel: "One" },
        { questionId: "b", questionPrompt: "Second?", answerLabel: "Two" },
      ],
    };
    const exhausted = JSON.stringify(buildInitialOpenAIRequest(input, "gpt-5.6-luna").input);
    expect(exhausted).toContain("you have asked 3 of 3 allowed questions");
    expect(exhausted).toContain("must finalize the route now");
  });

  it("rejects incoherent question output after one bounded validation pass", async () => {
    const incoherent = structuredClone(VALID_OUTPUT);
    const [first, second] = incoherent.clarification.question!.options;
    incoherent.clarification.question!.options = [first, { ...second, id: first.id }];
    const transport = new SequenceTransport([incoherent]);

    await expect(provider(transport).analyze(goalInput())).rejects.toMatchObject({ code: "PROVIDER_RESPONSE_INVALID" });
    expect(transport.requests).toHaveLength(1);
  });

  it("uses one failed-validation pass to repair malformed structured output", async () => {
    const transport = new SequenceTransport([
      { partial: "not the required schema" },
      { valid: false, issues: ["Schema was incomplete."], correctedOutput: VALID_OUTPUT },
    ]);
    const result = await provider(transport).analyze(goalInput());
    expect(result.analysis.documentTitle).toBe(VALID_OUTPUT.document.title);
    expect(transport.requests).toHaveLength(2);
    expect(JSON.stringify(transport.requests[1].input)).toContain("failed-validation");
  });

  it("rejects an overlong malformed response when the bounded repair is also invalid", async () => {
    const transport = new SequenceTransport([
      { ...VALID_OUTPUT, profileGoal: "x".repeat(5_000) },
      { invalid: true },
    ]);
    await expect(provider(transport).analyze(goalInput())).rejects.toMatchObject({ code: "PROVIDER_RESPONSE_INVALID" });
    expect(transport.requests).toHaveLength(2);
  });

  it("keeps a schema-valid primary result when the optional verification pass returns nothing usable", async () => {
    const highRisk = structuredClone(VALID_OUTPUT);
    highRisk.verification = { required: true, trigger: "high-risk", reasons: ["Deadline conflict"] };
    // The verification call comes back unusable; the primary already passed the
    // strict schema, so the case must still produce a route.
    const transport = new SequenceTransport([highRisk, { invalid: true }]);
    const result = await provider(transport).analyze(goalInput());

    expect(result.analysis.documentTitle).toBe(VALID_OUTPUT.document.title);
    expect(transport.requests).toHaveLength(2);
  });

  it("uses one structured verification pass only for an allowed high-risk trigger", async () => {
    const highRisk = structuredClone(VALID_OUTPUT);
    highRisk.verification = { required: true, trigger: "high-risk", reasons: ["Deadline conflict"] };
    const verified = { valid: true, issues: [], correctedOutput: highRisk };
    const transport = new SequenceTransport([highRisk, verified]);

    await provider(transport).analyze(goalInput());
    expect(transport.requests).toHaveLength(2);
    expect(transport.requests[1].reasoning.effort).toBe("xhigh");
  });

  it("does not add a tone-polishing or verification call for a routine valid route", async () => {
    const transport = new SequenceTransport([VALID_OUTPUT]);
    await provider(transport).analyze(goalInput());
    expect(transport.requests).toHaveLength(1);
    expect(shouldRunVerification(VALID_OUTPUT)).toBe(false);
  });

  it("retries one transient outage and does not expose the provider exception", async () => {
    const transport = new SequenceTransport([{ throwValue: { status: 503, message: "private provider detail" } }, VALID_OUTPUT]);
    const result = await provider(transport).analyze(goalInput());
    expect(result.processingMode).toBe("openai");
    expect(transport.requests).toHaveLength(2);
  });

  it.each([
    [{ status: 401 }, "PROVIDER_AUTH_ERROR"],
    [{ status: 429, code: "insufficient_quota" }, "PROVIDER_BILLING_ERROR"],
    [{ status: 429 }, "PROVIDER_RATE_LIMITED"],
  ])("maps provider failures to safe typed errors", async (failure, code) => {
    const transport = new SequenceTransport([{ throwValue: failure }, { throwValue: failure }]);
    await expect(provider(transport).analyze(goalInput())).rejects.toMatchObject({ code });
  });

  it("maps a plain timeout Error to PROVIDER_TIMEOUT rather than a generic outage", async () => {
    // The SDK surfaces `new Error("Request timed out.")` with no status, which
    // previously fell through to PROVIDER_UNAVAILABLE and misreported the cause.
    const transport = new SequenceTransport([{ throwValue: new Error("Request timed out.") }]);
    await expect(provider(transport).analyze(goalInput())).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });

  it("maps SDK timeouts without returning internal messages", async () => {
    const timeout = new Error("private timeout details");
    timeout.name = "APITimeoutError";
    await expect(provider(new SequenceTransport([timeout])).analyze(goalInput())).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });

  it("enforces the per-case provider request ceiling", async () => {
    const instance = new OpenAICaseBuilderProvider({
      apiKey: "synthetic-test-key",
      model: "gpt-5.6-luna",
      transport: new SequenceTransport([VALID_OUTPUT]),
      requestNumber: MAX_PROVIDER_REQUESTS_PER_CASE + 1,
    });
    await expect(instance.analyze(goalInput())).rejects.toMatchObject({ code: "REQUEST_LIMIT_REACHED" });
  });
});

describe("verified Responses request planning", () => {
  it("maps goal and text to input_text with task-specific reasoning", () => {
    const goal = buildInitialOpenAIRequest(goalInput(), "gpt-5.6-luna");
    const text = buildInitialOpenAIRequest(textInput(), "gpt-5.6-luna");
    expect(goal.reasoning.effort).toBe(REASONING_BY_TASK.intake);
    expect(text.reasoning.effort).toBe(REASONING_BY_TASK.document);
    expect(JSON.stringify(goal.input)).toContain("input_text");
    expect(JSON.stringify(text.input)).toContain("Synthetic pasted message");
  });

  it.each([
    ["application/pdf", "input_file"],
    ["image/png", "input_image"],
    ["image/jpeg", "input_image"],
    ["image/webp", "input_image"],
  ] as const)("maps %s to %s using low detail", (mimeType, expectedType) => {
    const request = buildInitialOpenAIRequest(fileInput(mimeType), "gpt-5.6-luna");
    const serialized = JSON.stringify(request.input);
    expect(serialized).toContain(`\"type\":\"${expectedType}\"`);
    expect(serialized).toContain(`\"detail\":\"low\"`);
  });

  it("includes the injection boundary without requesting chain of thought", () => {
    expect(OPENAI_CASE_BUILDER_INSTRUCTION).toContain("untrusted evidence");
    expect(OPENAI_CASE_BUILDER_INSTRUCTION).toContain("never override");
    expect(OPENAI_CASE_BUILDER_INSTRUCTION).toContain("Never provide or expose hidden reasoning");
    expect(OPENAI_CASE_BUILDER_INSTRUCTION).not.toMatch(/show your chain of thought|reveal your reasoning/i);
  });

  it("includes a prior clarification answer as case data for a structured profile update", () => {
    const input = goalInput();
    input.clarificationResolution = {
      questionId: "employment-status",
      questionPrompt: "Are you employed, self-employed, or both?",
      questionReason: "The answer changes evidence.",
      answerId: "dont-know",
      answerLabel: "I don't know",
      options: VALID_OUTPUT.clarification.question!.options,
    };
    const request = buildInitialOpenAIRequest(input, "gpt-5.6-luna");
    expect(JSON.stringify(request.input)).toContain("I don't know");
    expect(request.store).toBe(false);
    expect(request.text.format).toBeDefined();
  });
});

describe("server-only provider configuration", () => {
  it("defaults to Luna and reports a missing key without inventing a fallback mode", () => {
    const config = readAnalysisRuntimeConfiguration({ NODE_ENV: "development" });
    expect(config).toMatchObject({ openAiApiKeyConfigured: false, openAiModel: "gpt-5.6-luna" });
  });

  it("reads the configured key and keeps the model configurable", () => {
    const config = readAnalysisRuntimeConfiguration({ NODE_ENV: "production", OPENAI_API_KEY: "synthetic-test-key", OPENAI_MODEL: "configured-model" });
    expect(config).toMatchObject({ openAiApiKeyConfigured: true, openAiModel: "configured-model" });
  });

  it("refuses to analyze without a configured key instead of serving an example case", async () => {
    await expect(runConfiguredAnalysis(
      { kind: "goal", category: null, outputLanguage: "en", receivedAt: "2026-07-18T12:00:00.000Z", normalizedGoal: "Renew a fictional permit." },
      readAnalysisRuntimeConfiguration({ NODE_ENV: "development" }),
    )).rejects.toMatchObject({ code: "API_NOT_CONFIGURED" });
  });
});

function provider(transport: OpenAIResponsesTransport) {
  return new OpenAICaseBuilderProvider({ apiKey: "synthetic-test-key", model: "gpt-5.6-luna", transport });
}

function goalInput(): NormalizedCaseInput {
  return { kind: "goal", category: null, outputLanguage: "en", receivedAt: "2026-07-18T12:00:00.000Z", normalizedGoal: "Renew a fictional residence permit." };
}

function textInput(): NormalizedCaseInput {
  return { kind: "text", category: null, outputLanguage: "en", receivedAt: "2026-07-18T12:00:00.000Z", normalizedGoal: null, normalizedText: "Synthetic pasted message with enough context for a safe test." };
}

function fileInput(mimeType: SupportedFileMimeType): NormalizedCaseInput {
  return {
    kind: "file",
    category: null,
    outputLanguage: "en",
    receivedAt: "2026-07-18T12:00:00.000Z",
    normalizedGoal: null,
    file: {
      metadata: { filename: "synthetic-document", claimedMimeType: mimeType, detectedMimeType: mimeType, sizeBytes: 12 },
      bytes: new Uint8Array([1, 2, 3]),
    },
  };
}
