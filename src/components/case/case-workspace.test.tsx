import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CaseWorkspace } from "@/components/case/case-workspace";
import { CASE_FORM_FIELDS } from "@/domain/analysis-api";
import { isBureaucracyCategory } from "@/domain/categories";
import type { CaseInput, SupportedLanguage } from "@/domain/case";
import { MockDocumentAnalysisService } from "@/services/document-analysis";

const VALID_GOAL = "Renew a fictional residence permit and prepare the missing documents.";
const UPDATED_GOAL = "Register a fictional new address and understand the required steps.";
const VALID_TEXT = "This is a copied fictional official message with enough useful content for the mock route.";
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(mockSuccessfulAnalyzeFetch);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function selectEvidence(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("radio", { name: label }));
}

async function selectSample(user: ReturnType<typeof userEvent.setup>) {
  await selectEvidence(user, "Try sample");
  await user.click(screen.getByRole("button", { name: "Use fictional sample" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Build mock case" })).toBeEnabled());
}

async function buildUntilQuestion(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Build mock case" }));
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
    expect(screen.getByRole("radio", { name: "Goal only" })).toBeChecked();
    expect(screen.getByText("Understanding your goal")).toBeInTheDocument();
    expect(screen.queryByText(/Step 1/)).not.toBeInTheDocument();
  });

  it("shows a clear error for a blank or too-short goal", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    const goal = screen.getByLabelText("What do you need to get done?");

    await user.type(goal, "Too short");

    expect(screen.getByRole("alert")).toHaveTextContent("Add at least 10 non-whitespace characters");
    expect(screen.getByRole("button", { name: "Build mock case" })).toBeDisabled();
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
    expect(screen.getByRole("radio", { name: "I don't know" })).toBeInTheDocument();
    expect(screen.queryByTestId("analysis-result")).not.toBeInTheDocument();
  });

  it("asks one question and renders the complete route only after an answer", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);

    expect(screen.getAllByRole("heading", { name: "Are you currently employed, self-employed, or both?" })).toHaveLength(1);
    const result = await answerAndGetRoute(user);

    expect(result).toHaveAttribute("dir", "ltr");
    for (const heading of ["What this letter says", "Deadline and urgency", "What the authority wants", "Documents to prepare", "Your next steps", "Official sources", "Important limitation"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText("Profile sufficient for this fictional mock route.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Are you currently employed, self-employed, or both?" })).not.toBeInTheDocument();
  });

  it("accepts I don't know and keeps uncertainty in the route", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);

    const result = await answerAndGetRoute(user, "I don't know");

    expect(result).toHaveTextContent("Verify which income evidence applies");
    expect(result).toHaveTextContent("The work situation and accepted submission channel still need verification");
  });

  it("keeps pasted text as optional evidence and renders markup only as plain text", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await selectEvidence(user, "Paste text");
    const textarea = screen.getByLabelText("Paste the letter, email, or official message here");
    const markup = '<img src="invalid" onerror="alert(1)"> This remains plain official-message text.';
    fireEvent.change(textarea, { target: { value: markup } });

    expect(textarea).toHaveValue(markup);
    expect(textarea).toHaveAttribute("maxLength", "20000");
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
  });

  it("submits a goal together with pasted text", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="arrival-registration" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await selectEvidence(user, "Paste text");
    await user.type(screen.getByLabelText("Paste the letter, email, or official message here"), VALID_TEXT);

    await buildUntilQuestion(user);

    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.kind)).toBe("text");
    expect(formData.get(CASE_FORM_FIELDS.goal)).toBe(VALID_GOAL);
    expect(formData.get(CASE_FORM_FIELDS.text)).toBe(VALID_TEXT);
    expect(screen.getByText("Pasted official message")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Is this address your primary residence/,
      }),
    ).toBeInTheDocument();
  });

  it("warns before discarding active evidence but preserves the goal", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await selectEvidence(user, "Paste text");
    await user.type(screen.getByLabelText("Paste the letter, email, or official message here"), VALID_TEXT);

    await selectEvidence(user, "Upload document");
    expect(confirm).toHaveBeenCalledWith("Switching evidence methods will clear the current private evidence. Continue?");
    expect(screen.getByLabelText("What do you need to get done?")).toHaveValue(VALID_GOAL);
    confirm.mockRestore();
  });

  it("keeps the uploaded-file workflow and sends only metadata into the profile", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await selectEvidence(user, "Upload document");
    const file = new File(["test bytes"], "fictional-letter.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Choose a PDF or image letter"), file);
    await waitFor(() => expect(screen.getByRole("button", { name: "Build mock case" })).toBeEnabled());

    await buildUntilQuestion(user);

    expect(screen.getByText("Uploaded PDF document")).toBeInTheDocument();
    expect(screen.queryByText("fictional-letter.pdf")).not.toBeInTheDocument();
    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.file)).toMatchObject({
      name: "fictional-letter.pdf",
      type: "application/pdf",
    });
  });

  it("preserves sample mode, Arabic RTL, and route adaptation", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await selectSample(user);
    await user.click(screen.getByRole("radio", { name: /Arabic/i }));
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
    expect(fetchMock).toHaveBeenCalledTimes(2);
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
    await user.click(screen.getByRole("radio", { name: "Both" }));

    expect(await screen.findByText("Prepare both sets of income evidence")).toBeInTheDocument();
    expect(screen.getByText(/1 correction remembered/)).toBeInTheDocument();
  });

  it("clears the goal, evidence, and category on start over", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await buildUntilQuestion(user);
    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(screen.getByLabelText("What do you need to get done?")).toHaveValue("");
    expect(screen.getByLabelText("Bureaucracy category")).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Goal only" })).toBeChecked();
  });

  it("displays typed server errors without raw exceptions", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: { code: "FILE_SIGNATURE_MISMATCH", message: "<script>raw server exception</script>", requestId: "request-ui-safe-001" } }) } as Response);
    render(<CaseWorkspace />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    await user.click(screen.getByRole("button", { name: "Build mock case" }));

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
    const button = screen.getByRole("button", { name: "Build mock case" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRequest(await successfulResponseForGoal());
    expect(await screen.findByRole("heading", { name: "What the route currently uses" })).toBeInTheDocument();
  });

  it("requires real-mode consent and sends only the consent flag, never a browser secret", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace analysisMode="openai" />);
    await user.type(screen.getByLabelText("What do you need to get done?"), VALID_GOAL);
    const analyze = screen.getByRole("button", { name: "Analyze case" });
    expect(analyze).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /Send this case to OpenAI/ }));
    expect(analyze).toBeEnabled();
    await user.click(analyze);
    await screen.findByRole("heading", { name: /Are you currently/ });
    const formData = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(formData.get(CASE_FORM_FIELDS.consentToOpenAI)).toBe("true");
    expect(Array.from(formData.keys())).not.toContain("OPENAI_API_KEY");
  });
});

async function mockSuccessfulAnalyzeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  expect(input).toBe("/api/cases/analyze");
  const formData = init?.body as FormData;
  const caseInput = caseInputFromFormData(formData);
  const analysis = await new MockDocumentAnalysisService(0).analyzeDocument(caseInput);
  return { ok: true, json: async () => ({ analysis, metadata: { requestId: "request-ui-mock", processingMode: "mock", inputKind: caseInput.kind, receivedAt: "2026-07-18T12:00:00.000Z", retentionStatus: "discarded-after-processing" } }) } as Response;
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
