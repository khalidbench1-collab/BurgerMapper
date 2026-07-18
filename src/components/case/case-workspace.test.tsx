import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CaseWorkspace } from "@/components/case/case-workspace";
import { CASE_FORM_FIELDS } from "@/domain/analysis-api";
import { isBureaucracyCategory } from "@/domain/categories";
import type { CaseInput, SupportedLanguage } from "@/domain/case";
import { MockDocumentAnalysisService } from "@/services/document-analysis";

const VALID_TEXT =
  "This is a copied fictional official message with enough useful content for the mock route.";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(mockSuccessfulAnalyzeFetch);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function selectSampleAndWaitUntilReady(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole("radio", { name: "Try sample" }));
  await user.click(screen.getByRole("button", { name: "Use fictional sample" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Run mock analysis" })).toBeEnabled(),
  );
}

async function runCurrentMockAnalysis(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.click(screen.getByRole("button", { name: "Run mock analysis" }));
  return screen.findByTestId("analysis-result", {}, { timeout: 3_000 });
}

describe("CaseWorkspace", () => {
  it("renders the key sections after the existing sample workflow", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await selectSampleAndWaitUntilReady(user);

    const result = await runCurrentMockAnalysis(user);

    expect(result).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("heading", { name: "What this letter says" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deadline and urgency" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What the authority wants" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Documents to prepare" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your next steps" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Official sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Important limitation" })).toBeInTheDocument();
  });

  it("selects and clears an optional category", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    const select = screen.getByLabelText("Bureaucracy category");

    expect(select).toHaveValue("visa-immigration");
    expect(screen.getByText(/Visa & Immigration:/)).toBeInTheDocument();

    await user.selectOptions(select, "");

    expect(select).toHaveValue("");
    expect(
      screen.getByText("Continue without a category if none of these feels right."),
    ).toBeInTheDocument();
  });

  it("validates too-short pasted text", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);

    await user.type(
      screen.getByLabelText("Paste the letter, email, or official message here"),
      "Too short",
    );
    await user.click(screen.getByRole("button", { name: "Run mock analysis" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Add at least 20 non-whitespace characters so the message is useful.",
    );
  });

  it("analyzes valid pasted text through mock mode and shows category context", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="arrival-registration" />);

    await user.type(
      screen.getByLabelText("Paste the letter, email, or official message here"),
      VALID_TEXT,
    );
    const result = await runCurrentMockAnalysis(user);

    expect(result).toHaveTextContent(
      "Case category: Arrival & Registration",
    );
    expect(result).toHaveTextContent(
      "The pasted text was validated in memory by the application server but was not interpreted or understood by AI",
    );
    expect(
      screen.getByRole("heading", {
        name: "Request to complete address registration — fictional sample",
      }),
    ).toBeInTheDocument();
  });

  it("renders pasted markup only as textarea text", () => {
    render(<CaseWorkspace />);
    const unsafeLookingText =
      '<img src="invalid" onerror="alert(1)"> This remains plain official-message text.';
    const textarea = screen.getByLabelText(
      "Paste the letter, email, or official message here",
    );

    fireEvent.change(textarea, { target: { value: unsafeLookingText } });

    expect(textarea).toHaveValue(unsafeLookingText);
    expect(document.querySelector("img")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
  });

  it("warns on active mode switching and clears discarded pasted text", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<CaseWorkspace />);
    const textarea = screen.getByLabelText(
      "Paste the letter, email, or official message here",
    );
    await user.type(textarea, VALID_TEXT);

    await user.click(screen.getByRole("radio", { name: "Upload document" }));

    expect(confirm).toHaveBeenCalledWith(
      "Switching input methods will clear the current private input. Continue?",
    );
    await user.click(screen.getByRole("radio", { name: "Paste text" }));
    expect(
      screen.getByLabelText("Paste the letter, email, or official message here"),
    ).toHaveValue("");
    confirm.mockRestore();
  });

  it("clears pasted text and category when the case is reset", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await user.type(
      screen.getByLabelText("Paste the letter, email, or official message here"),
      VALID_TEXT,
    );
    await runCurrentMockAnalysis(user);

    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(
      screen.getByLabelText("Paste the letter, email, or official message here"),
    ).toHaveValue("");
    expect(screen.getByLabelText("Bureaucracy category")).toHaveValue("");
  });

  it("keeps the existing uploaded-file workflow working", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await user.click(screen.getByRole("radio", { name: "Upload document" }));
    const file = new File(["test bytes"], "fictional-letter.pdf", {
      type: "application/pdf",
    });

    await user.upload(screen.getByLabelText("Choose a PDF or image letter"), file);
    expect(
      await screen.findByRole("heading", { name: "fictional-letter.pdf" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Run mock analysis" })).toBeEnabled(),
    );

    const result = await runCurrentMockAnalysis(user);
    expect(result).toHaveTextContent(
      "The selected file was signature-checked in memory by the application server but was not interpreted by AI",
    );
  });

  it("uses RTL for Arabic and adapts the existing visa route", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace initialCategory="visa-immigration" />);
    await selectSampleAndWaitUntilReady(user);
    await user.click(screen.getByRole("radio", { name: /Arabic/i }));

    const result = await runCurrentMockAnalysis(user);
    expect(result).toHaveAttribute("dir", "rtl");
    expect(result).toHaveAttribute("lang", "ar");
    expect(screen.getByRole("heading", { name: "خطواتك التالية" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "موظف" }));

    expect(await screen.findByText("تم تحديث المسار وفق إجابتك")).toBeInTheDocument();
    expect(screen.getByText("إثبات دخل من الوظيفة")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("dir", "ltr");
  });

  it("enforces the text maximum on the textarea", () => {
    render(<CaseWorkspace />);

    expect(
      screen.getByLabelText("Paste the letter, email, or official message here"),
    ).toHaveAttribute("maxLength", "20000");
  });

  it("displays typed server errors without rendering raw exceptions", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: {
          code: "FILE_SIGNATURE_MISMATCH",
          message: "<script>raw server exception</script>",
          requestId: "request-ui-safe-001",
        },
      }),
    } as Response);
    render(<CaseWorkspace />);
    await user.type(
      screen.getByLabelText("Paste the letter, email, or official message here"),
      VALID_TEXT,
    );

    await user.click(screen.getByRole("button", { name: "Run mock analysis" }));

    const alert = await screen.findByTestId("analysis-api-error");
    expect(alert).toHaveTextContent(
      "The file contents do not match the selected document type.",
    );
    expect(alert).toHaveTextContent("FILE_SIGNATURE_MISMATCH");
    expect(alert).toHaveTextContent("request-ui-safe-001");
    expect(alert).not.toHaveTextContent("raw server exception");
    expect(document.querySelector("script")).toBeNull();
  });

  it("prevents duplicate analysis requests while one is active", async () => {
    const user = userEvent.setup();
    let resolveRequest!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    render(<CaseWorkspace />);
    await user.type(
      screen.getByLabelText("Paste the letter, email, or official message here"),
      VALID_TEXT,
    );
    const button = screen.getByRole("button", { name: "Run mock analysis" });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveRequest(await successfulResponseForText());
    expect(await screen.findByTestId("analysis-result")).toBeInTheDocument();
  });
});

async function mockSuccessfulAnalyzeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  expect(input).toBe("/api/cases/analyze");
  const formData = init?.body as FormData;
  const caseInput = caseInputFromFormData(formData);
  const analysis = await new MockDocumentAnalysisService(0).analyzeDocument(
    caseInput,
  );
  return {
    ok: true,
    json: async () => ({
      analysis,
      metadata: {
        requestId: "request-ui-mock",
        processingMode: "mock",
        inputKind: caseInput.kind,
        receivedAt: "2026-07-18T12:00:00.000Z",
        retentionStatus: "discarded-after-processing",
      },
    }),
  } as Response;
}

function caseInputFromFormData(formData: FormData): CaseInput {
  const kind = String(formData.get(CASE_FORM_FIELDS.kind));
  const outputLanguage = String(
    formData.get(CASE_FORM_FIELDS.outputLanguage),
  ) as SupportedLanguage;
  const categoryValue = formData.get(CASE_FORM_FIELDS.category);
  const category =
    typeof categoryValue === "string" && isBureaucracyCategory(categoryValue)
      ? categoryValue
      : undefined;

  if (kind === "text") {
    return {
      kind,
      text: String(formData.get(CASE_FORM_FIELDS.text)),
      outputLanguage,
      ...(category ? { category } : {}),
    };
  }
  if (kind === "sample") {
    return {
      kind,
      sampleId: String(formData.get(CASE_FORM_FIELDS.sampleId)),
      outputLanguage,
      ...(category ? { category } : {}),
    };
  }
  const file = formData.get(CASE_FORM_FIELDS.file) as File;
  return {
    kind: "file",
    outputLanguage,
    ...(category ? { category } : {}),
    document: {
      id: "synthetic-ui-file",
      file,
      metadata: {
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        selectedAt: "2026-07-18T12:00:00.000Z",
        source: "upload",
      },
    },
  };
}

async function successfulResponseForText(): Promise<Response> {
  const formData = new FormData();
  formData.set(CASE_FORM_FIELDS.kind, "text");
  formData.set(CASE_FORM_FIELDS.outputLanguage, "en");
  formData.set(CASE_FORM_FIELDS.text, VALID_TEXT);
  return mockSuccessfulAnalyzeFetch("/api/cases/analyze", {
    method: "POST",
    body: formData,
  });
}
