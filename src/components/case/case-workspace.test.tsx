import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CaseWorkspace } from "@/components/case/case-workspace";
import { CASE_FORM_FIELDS } from "@/domain/analysis-api";
import { RESEARCH_CASE_ENDPOINT } from "@/domain/research-api";
import { isBureaucracyCategory } from "@/domain/categories";
import type { CaseInput, SupportedLanguage } from "@/domain/case";
import { createMockCaseProfile } from "@/services/case-builder";
import { MockDocumentAnalysisService } from "@/services/document-analysis";

const VALID_GOAL = "Renew a fictional residence permit and prepare the missing documents.";
const UPDATED_GOAL = "Register a fictional new address and understand the required steps.";
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(mockSuccessfulAnalyzeFetch);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function buildUntilQuestion(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Guide me" }));
  return screen.findByRole("heading", { name: /Are you currently|Sind Sie derzeit|هل تعمل حاليًا|Is this address|Will you freelance/ });
}

async function answerAndGetRoute(user: ReturnType<typeof userEvent.setup>, answer = "Employed") {
  await user.click(screen.getByRole("radio", { name: answer }));
  return screen.findByTestId("analysis-result");
}

describe("CaseWorkspace", () => {
  it("makes the goal the primary entry and enforces its limit", () => {
    render(<CaseWorkspace />);

    expect(screen.getByRole("heading", { name: "What do you need to get done?" })).toBeInTheDocument();
    expect(screen.getByLabelText("What do you need to get done?")).toHaveAttribute("maxLength", "1000");
    expect(screen.getByRole("button", { name: "Guide me" })).toBeInTheDocument();
    expect(screen.getByText("Understanding your goal")).toBeInTheDocument();
    expect(screen.queryByText(/Step 1/)).not.toBeInTheDocument();
  });

  it("shows a clear error for a blank or too-short goal", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    const goal = screen.getByLabelText("What do you need to get done?");

    await user.type(goal, "Too short");

    expect(screen.getByRole("alert")).toHaveTextContent("Add at least 10 non-whitespace characters");
    expect(screen.getByRole("button", { name: "Guide me" })).toBeDisabled();
  });

  it("builds a goal-only profile through the server boundary", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);

    await buildUntilQuestion(user);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.kind)).toBe("goal");
    expect(formData.get(CASE_FORM_FIELDS.goal)).toBe(VALID_GOAL);
    expect(screen.getByRole("heading", { name: "What the route currently uses" })).toBeInTheDocument();
    expect(screen.getByText(VALID_GOAL)).toBeInTheDocument();
    expect(screen.getByText("Goal only — no document added")).toBeInTheDocument();
    expect(screen.getByText("Visa & Immigration")).toBeInTheDocument();
    expect(screen.getByText("Why this changes the route:")).toBeInTheDocument();
    expect(screen.queryByTestId("analysis-result")).not.toBeInTheDocument();
  });

  it("shows only two answer options plus a typed-answer field", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);

    expect(screen.getAllByRole("radio", { name: /Employed|Self-employed/ })).toHaveLength(2);
    expect(screen.queryByRole("radio", { name: "Both" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "I don't know" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Neither — type your answer")).toBeInTheDocument();
  });

  it("asks one question and renders the complete route only after an answer", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);

    expect(screen.getAllByRole("heading", { name: "Are you currently employed, self-employed, or both?" })).toHaveLength(1);
    const result = await answerAndGetRoute(user);

    expect(result).toHaveAttribute("dir", "ltr");
    for (const heading of ["What this means for your case", "Deadline and urgency", "What the authority wants", "Documents to prepare", "Your next steps", "Official sources", "Important limitation"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText("Profile sufficient for this analyzed route.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Are you currently employed, self-employed, or both?" })).not.toBeInTheDocument();
  });

  it("accepts a typed exact answer and finalizes the route", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);

    await user.type(screen.getByLabelText("Neither — type your answer"), "My permit says § 21 AufenthG");
    await user.click(screen.getByRole("button", { name: "Use this answer" }));

    const result = await screen.findByTestId("analysis-result");
    expect(result).toBeInTheDocument();
    expect(screen.getByText("My permit says § 21 AufenthG")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Are you currently employed, self-employed, or both?" })).not.toBeInTheDocument();
  });

  it("uploads a document from the goal box and sends only metadata into the profile", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    const file = new File(["test bytes"], "fictional-letter.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Attach a PDF or image"), file);
    await waitFor(() => expect(screen.getByText("fictional-letter.pdf")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("button", { name: "Guide me" })).toBeEnabled());

    await buildUntilQuestion(user);

    expect(screen.getByText("Uploaded PDF document")).toBeInTheDocument();
    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.kind)).toBe("file");
    expect(formData.get(CASE_FORM_FIELDS.file)).toMatchObject({
      name: "fictional-letter.pdf",
      type: "application/pdf",
    });
  });

  it("removes an attached document and falls back to a goal-only case", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    const file = new File(["test bytes"], "fictional-letter.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Attach a PDF or image"), file);
    await waitFor(() => expect(screen.getByText("fictional-letter.pdf")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.queryByText("fictional-letter.pdf")).not.toBeInTheDocument();
    await buildUntilQuestion(user);
    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.kind)).toBe("goal");
  });

  it("supports Arabic RTL output and route adaptation", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await user.click(screen.getByRole("button", { name: /Output language/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /Arabic/i }));
    await buildUntilQuestion(user);

    const result = await answerAndGetRoute(user, "موظف");
    expect(result).toHaveAttribute("dir", "rtl");
    expect(result).toHaveAttribute("lang", "ar");
    expect(screen.getByRole("heading", { name: "خطواتك التالية" })).toBeInTheDocument();
    expect(screen.getByText("إثبات دخل من الوظيفة")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("dir", "ltr");
  });

  it("rebuilds after a goal correction and clears the prior answer", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);
    await answerAndGetRoute(user);
    await user.click(screen.getByRole("button", { name: "Edit case details" }));
    const goalEditor = screen.getByLabelText("Goal");
    await user.clear(goalEditor);
    await user.type(goalEditor, UPDATED_GOAL);
    await user.selectOptions(screen.getByLabelText("Optional category"), "arrival-registration");
    await user.click(screen.getByRole("button", { name: "Save and rebuild question" }));

    expect(await screen.findByRole("heading", { name: /Is this address your primary residence/ })).toBeInTheDocument();
    // Build, answer, and rebuild are each a server round-trip now that answers
    // are never resolved client-side.
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/cases/analyze")).toHaveLength(3);
    expect(screen.getByText(UPDATED_GOAL)).toBeInTheDocument();
    expect(screen.getByText(/2 corrections remembered/)).toBeInTheDocument();
    expect(screen.queryByTestId("analysis-result")).not.toBeInTheDocument();
  });

  it("remembers a corrected clarification answer and recomputes the route", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);
    await answerAndGetRoute(user, "Employed");
    await user.click(screen.getByRole("button", { name: "Change this answer" }));
    await user.click(screen.getByRole("radio", { name: "Self-employed" }));

    expect(await screen.findByText("Prepare self-employment income evidence")).toBeInTheDocument();
    expect(screen.getByText(/1 correction remembered/)).toBeInTheDocument();
  });

  it("clears the goal and evidence on start over", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);
    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(screen.getByLabelText("What do you need to get done?")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Guide me" })).toBeDisabled();
  });

  it("displays typed server errors without raw exceptions", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: { code: "FILE_SIGNATURE_MISMATCH", message: "<script>raw server exception</script>", requestId: "request-ui-safe-001" } }) } as Response);
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await user.click(screen.getByRole("button", { name: "Guide me" }));

    const alert = await screen.findByTestId("analysis-api-error");
    expect(alert).toHaveTextContent("The file contents do not match the selected document type.");
    expect(alert).toHaveTextContent("request-ui-safe-001");
    expect(alert).not.toHaveTextContent("raw server exception");
    expect(document.querySelector("script")).toBeNull();
  });

  it("prevents duplicate requests while one is active", async () => {
    const user = userEvent.setup();
    let resolveRequest!: (response: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveRequest = resolve; }));
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    const button = screen.getByRole("button", { name: "Guide me" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRequest(await successfulResponseForGoal());
    expect(await screen.findByRole("heading", { name: "What the route currently uses" })).toBeInTheDocument();
  });

  it("sends the consent flag in real mode without exposing a browser secret", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    const analyze = screen.getByRole("button", { name: "Guide me" });
    expect(analyze).toBeEnabled();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    await user.click(analyze);
    await screen.findByRole("heading", { name: /Are you currently/ });
    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.consentToOpenAI)).toBe("true");
    expect(Array.from(formData.keys())).not.toContain("OPENAI_API_KEY");
  });

  it("researches only after sufficiency and sends no goal or evidence content", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);

    expect(fetchMock.mock.calls.some(([url]) => url === RESEARCH_CASE_ENDPOINT)).toBe(false);
    await answerAndGetRoute(user);

    const researchCall = fetchMock.mock.calls.find(([url]) => url === RESEARCH_CASE_ENDPOINT);
    expect(researchCall).toBeDefined();
    const body = JSON.parse(String(researchCall?.[1]?.body));
    expect(body).toEqual({
      topic: "residence-permit-renewal",
      category: "visa-immigration",
      outputLanguage: "en",
      profileSufficiency: "sufficient",
    });
    expect(JSON.stringify(body)).not.toContain(VALID_GOAL);
  });
});

async function mockSuccessfulAnalyzeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (input === RESEARCH_CASE_ENDPOINT) {
    return {
      ok: true,
      json: async () => ({
        research: {
          sources: [],
          claims: [],
          stepEvidence: [],
          summary: {
            status: "no-sources",
            researchedAt: "2026-07-18T12:05:00.000Z",
            provider: "curated-official-sources",
            limitations: ["Synthetic UI fallback."],
            escalation: "Confirm with the authority.",
          },
        },
        metadata: {
          requestId: "research-ui-mock",
          receivedAt: "2026-07-18T12:05:00.000Z",
          retentionStatus: "discarded-after-processing",
          inputScope: "abstract-route-topic-only",
        },
      }),
    } as Response;
  }
  expect(input).toBe("/api/cases/analyze");
  const formData = init?.body as FormData;
  const caseInput = caseInputFromFormData(formData);
  const analysis = await new MockDocumentAnalysisService(0).analyzeDocument(caseInput);
  // The real server always returns a profile and resolves the question once an
  // answer arrives, so the stub must do the same for the round-trip to finish.
  const profile = buildStubProfile(caseInput, analysis, formData);
  return { ok: true, json: async () => ({ analysis, profile, metadata: { requestId: "request-ui-mock", processingMode: "openai", inputKind: caseInput.kind, receivedAt: "2026-07-18T12:00:00.000Z", retentionStatus: "discarded-after-processing" } }) } as Response;
}

function buildStubProfile(caseInput: CaseInput, analysis: Parameters<typeof createMockCaseProfile>[1], formData: FormData) {
  const profile = createMockCaseProfile(caseInput, analysis);
  const raw = formData.get(CASE_FORM_FIELDS.clarificationResolution);
  if (typeof raw !== "string" || !raw) return profile;
  const resolution = JSON.parse(raw) as {
    questionId: string;
    answerId: string;
    answerLabel: string;
    answerHistory?: Array<{ questionId: string; answerLabel: string }>;
  };
  const answeredAt = analysis.generatedAt;
  return {
    ...profile,
    answers: [
      ...(resolution.answerHistory ?? []).map((entry) => ({
        questionId: entry.questionId,
        answerId: entry.questionId,
        label: entry.answerLabel,
        routeImpact: "An earlier answer.",
        answeredAt,
      })),
      {
        questionId: resolution.questionId,
        answerId: resolution.answerId,
        label: resolution.answerLabel,
        routeImpact: "The route was rebuilt using this answer.",
        answeredAt,
      },
    ],
    sufficiency: { state: "sufficient" as const, reason: "The answer completed the profile.", nextQuestionId: null },
    status: "route-ready" as const,
  };
}

function caseInputFromFormData(formData: FormData): CaseInput {
  const kind = String(formData.get(CASE_FORM_FIELDS.kind));
  const outputLanguage = String(formData.get(CASE_FORM_FIELDS.outputLanguage)) as SupportedLanguage;
  const categoryValue = formData.get(CASE_FORM_FIELDS.category);
  const category = typeof categoryValue === "string" && isBureaucracyCategory(categoryValue) ? categoryValue : undefined;
  const goalValue = formData.get(CASE_FORM_FIELDS.goal);
  const goal = typeof goalValue === "string" && goalValue ? goalValue : undefined;
  const shared = { outputLanguage, ...(category ? { category } : {}), ...(goal ? { goal } : {}) };
  if (kind === "goal") return { kind, goal: goal!, ...shared };
  if (kind === "text") return { kind, text: String(formData.get(CASE_FORM_FIELDS.text)), ...shared };
  if (kind === "sample") return { kind, sampleId: String(formData.get(CASE_FORM_FIELDS.sampleId)), ...shared };
  const file = formData.get(CASE_FORM_FIELDS.file) as File;
  return { kind: "file", ...shared, document: { id: "synthetic-ui-file", file, metadata: { name: file.name, mimeType: file.type, sizeBytes: file.size, selectedAt: "2026-07-18T12:00:00.000Z", source: "upload" } } };
}

async function successfulResponseForGoal(): Promise<Response> {
  const formData = new FormData();
  formData.set(CASE_FORM_FIELDS.kind, "goal");
  formData.set(CASE_FORM_FIELDS.outputLanguage, "en");
  formData.set(CASE_FORM_FIELDS.goal, VALID_GOAL);
  return mockSuccessfulAnalyzeFetch("/api/cases/analyze", { method: "POST", body: formData });
}
