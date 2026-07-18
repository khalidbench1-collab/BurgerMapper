"use client";

import { useEffect, useRef, useState } from "react";

import { AnalysisLoadingState } from "@/components/case/analysis-loading-state";
import { AnalysisResult } from "@/components/case/analysis-result";
import { CategorySelector } from "@/components/case/category-selector";
import { DocumentDropzone } from "@/components/case/document-dropzone";
import { InputMethodSelector } from "@/components/case/input-method-selector";
import { IntakeProgress } from "@/components/case/intake-progress";
import { LanguageSelector } from "@/components/case/language-selector";
import {
  FICTIONAL_SAMPLE_ID,
  SampleInputPanel,
} from "@/components/case/sample-input-panel";
import { SelectedDocumentCard } from "@/components/case/selected-document-card";
import { TextInputPanel } from "@/components/case/text-input-panel";
import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseInput,
  CaseState,
  ClarificationAnswerId,
  InputKind,
  SupportedLanguage,
} from "@/domain/case";
import type { CaseAnalysisErrorCode } from "@/domain/analysis-api";
import {
  createFileCaseInput,
  createSampleCaseInput,
  createTextCaseInput,
} from "@/lib/case-input";
import {
  createUploadedDocument,
  validateDocumentFile,
} from "@/lib/file-validation";
import { validatePastedText } from "@/lib/text-validation";
import {
  adaptAnalysisToClarification,
} from "@/services/document-analysis";
import {
  AnalysisApiError,
  ServerDocumentAnalysisService,
} from "@/services/server-document-analysis";

const serverAnalysisService = new ServerDocumentAnalysisService();

interface RequestErrorState {
  code: CaseAnalysisErrorCode;
  message: string;
  requestId: string | null;
}

function createInitialState(
  category: BureaucracyCategory | null = null,
): CaseState {
  return {
    status: "idle",
    inputKind: "text",
    category,
    textInput: "",
    document: null,
    sampleId: null,
    outputLanguage: "en",
    analysis: null,
    validationError: null,
  };
}

export function CaseWorkspace({
  initialCategory = null,
}: {
  initialCategory?: BureaucracyCategory | null;
}) {
  const [caseState, setCaseState] = useState<CaseState>(() =>
    createInitialState(initialCategory),
  );
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const requestId = useRef(0);
  const activeRequestController = useRef<AbortController | null>(null);
  const [requestError, setRequestError] = useState<RequestErrorState | null>(null);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      activeRequestController.current?.abort();
    };
  }, []);

  function queue(callback: () => void, delayMs: number) {
    const timer = setTimeout(callback, delayMs);
    timers.current.push(timer);
  }

  function clearPendingWork() {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    requestId.current += 1;
    activeRequestController.current?.abort();
    activeRequestController.current = null;
    setRequestError(null);
  }

  function handleInputModeChange(nextKind: InputKind) {
    if (nextKind === caseState.inputKind) return;

    if (
      hasActiveInput(caseState) &&
      !window.confirm(
        "Switching input methods will clear the current private input. Continue?",
      )
    ) {
      return;
    }

    clearPendingWork();
    setCaseState((current) => ({
      ...current,
      status: "idle",
      inputKind: nextKind,
      textInput: "",
      document: null,
      sampleId: null,
      analysis: null,
      validationError: null,
    }));
  }

  function handleCategoryChange(category: BureaucracyCategory | null) {
    setRequestError(null);
    setCaseState((current) => ({ ...current, category }));
  }

  function handleTextChange(textInput: string) {
    const isReady = validatePastedText(textInput).valid;
    setCaseState((current) => ({
      ...current,
      textInput,
      status: isReady ? "ready" : "idle",
      analysis: null,
      validationError: null,
    }));
    setRequestError(null);
  }

  function handleFileSelected(file: File) {
    clearPendingWork();
    setCaseState((current) => ({
      ...current,
      status: "validating",
      document: null,
      analysis: null,
      validationError: null,
    }));

    queue(() => {
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        setCaseState((current) => ({
          ...current,
          status: "error",
          validationError: validation.error,
        }));
        return;
      }

      setCaseState((current) => ({
        ...current,
        status: "file-selected",
        document: createUploadedDocument(file),
        validationError: null,
      }));
      queue(() => {
        setCaseState((current) => ({ ...current, status: "ready" }));
      }, 180);
    }, 220);
  }

  function handleSampleSelected() {
    clearPendingWork();
    setCaseState((current) => ({
      ...current,
      status: "file-selected",
      sampleId: FICTIONAL_SAMPLE_ID,
      analysis: null,
      validationError: null,
    }));
    queue(() => {
      setCaseState((current) => ({ ...current, status: "ready" }));
    }, 180);
  }

  function handleLanguageChange(outputLanguage: SupportedLanguage) {
    setRequestError(null);
    setCaseState((current) => ({ ...current, outputLanguage }));
  }

  function handleRemoveDocument() {
    clearPendingWork();
    setCaseState((current) => ({
      ...current,
      status: "idle",
      document: null,
      analysis: null,
      validationError: null,
    }));
  }

  function handleStartOver() {
    clearPendingWork();
    setCaseState(createInitialState());
  }

  function buildActiveInput(): CaseInput | null {
    const { category, outputLanguage } = caseState;

    if (caseState.inputKind === "text") {
      const result = createTextCaseInput(
        caseState.textInput,
        outputLanguage,
        category,
      );
      if (!result.valid) {
        setCaseState((current) => ({
          ...current,
          status: "error",
          validationError: result.error,
        }));
        return null;
      }
      setCaseState((current) => ({
        ...current,
        textInput: result.input.text,
      }));
      return result.input;
    }

    if (caseState.inputKind === "file" && caseState.document) {
      return createFileCaseInput(
        caseState.document,
        outputLanguage,
        category,
      );
    }

    if (caseState.inputKind === "sample" && caseState.sampleId) {
      return createSampleCaseInput(
        caseState.sampleId,
        outputLanguage,
        category,
      );
    }

    return null;
  }

  async function handleAnalyze() {
    if (caseState.status === "mock-analyzing" || activeRequestController.current) return;
    const input = buildActiveInput();
    if (!input) return;

    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    const controller = new AbortController();
    activeRequestController.current = controller;
    const activeRequest = requestId.current + 1;
    requestId.current = activeRequest;
    setCaseState((current) => ({
      ...current,
      status: "mock-analyzing",
      validationError: null,
    }));
    setRequestError(null);

    try {
      const analysis = await serverAnalysisService.analyzeDocument(
        input,
        controller.signal,
      );
      if (requestId.current !== activeRequest) return;

      setCaseState((current) => ({
        ...current,
        status: "analysis-complete",
        analysis,
      }));
    } catch (error) {
      if (controller.signal.aborted) return;
      if (requestId.current !== activeRequest) return;
      const apiError =
        error instanceof AnalysisApiError
          ? error
          : new AnalysisApiError("INTERNAL_ERROR", null);
      setRequestError({
        code: apiError.code,
        message: apiError.message,
        requestId: apiError.requestId,
      });
      setCaseState((current) => ({
        ...current,
        status: "error",
        validationError: null,
      }));
    } finally {
      if (activeRequestController.current === controller) {
        activeRequestController.current = null;
      }
    }
  }

  function handleClarification(answer: ClarificationAnswerId) {
    setCaseState((current) =>
      current.analysis
        ? {
            ...current,
            analysis: adaptAnalysisToClarification(current.analysis, answer),
          }
        : current,
    );
  }

  const liveMessage = requestError?.message ?? getLiveMessage(caseState);
  const isBusy =
    caseState.status === "validating" ||
    caseState.status === "mock-analyzing";
  const canAnalyze =
    caseState.inputKind === "text" ||
    (caseState.inputKind === "file" && Boolean(caseState.document)) ||
    (caseState.inputKind === "sample" && Boolean(caseState.sampleId));

  return (
    <div className="space-y-6">
      <IntakeProgress status={caseState.status} />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </p>

      {caseState.status === "analysis-complete" && caseState.analysis ? (
        <AnalysisResult
          analysis={caseState.analysis}
          onAnswer={handleClarification}
          onStartOver={handleStartOver}
        />
      ) : (
        <>
          <CategorySelector
            value={caseState.category}
            onChange={handleCategoryChange}
            disabled={isBusy}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
            <section
              aria-labelledby="input-step-heading"
              className="rounded-[1.5rem] border border-[#d6dbd7] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.06)] sm:p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
                Step 1
              </p>
              <h2
                id="input-step-heading"
                className="mt-2 text-xl font-semibold text-[#1d2b24]"
              >
                Add the official message
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#68736d]">
                Paste plain text, upload a PDF or image, or use the fictional
                sample. Only one input method is active.
              </p>

              <div className="mt-6">
                <InputMethodSelector
                  value={caseState.inputKind}
                  onChange={handleInputModeChange}
                  disabled={isBusy}
                />
              </div>

              <div className="mt-6 border-t border-[#e0e4e0] pt-6">
                {caseState.inputKind === "text" ? (
                  <TextInputPanel
                    value={caseState.textInput}
                    error={caseState.validationError}
                    onChange={handleTextChange}
                    disabled={isBusy}
                  />
                ) : null}

                {caseState.inputKind === "file" ? (
                  caseState.document ? (
                    <SelectedDocumentCard
                      document={caseState.document}
                      onRemove={handleRemoveDocument}
                      disabled={isBusy}
                    />
                  ) : (
                    <DocumentDropzone
                      disabled={isBusy}
                      error={caseState.validationError}
                      onFileSelected={handleFileSelected}
                    />
                  )
                ) : null}

                {caseState.inputKind === "sample" ? (
                  <SampleInputPanel
                    selected={Boolean(caseState.sampleId)}
                    onSelect={handleSampleSelected}
                    disabled={isBusy}
                  />
                ) : null}
              </div>
            </section>

            <aside className="space-y-5 rounded-[1.5rem] border border-[#d6dbd7] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.06)] sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
                  Step 2
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#1d2b24]">
                  Choose your explanation
                </h2>
              </div>

              <LanguageSelector
                value={caseState.outputLanguage}
                onChange={handleLanguageChange}
                disabled={isBusy}
              />

              <div className="border-t border-[#e0e4e0] pt-5">
                {requestError ? (
                  <div
                    role="alert"
                    data-testid="analysis-api-error"
                    className="mb-4 rounded-xl border border-[#e3b4a8] bg-[#fff7f4] p-4 text-sm text-[#7d3325]"
                  >
                    <p className="font-semibold">{requestError.message}</p>
                    <p className="mt-1 text-xs">
                      Error code: {requestError.code}
                      {requestError.requestId
                        ? ` · Request reference: ${requestError.requestId}`
                        : ""}
                    </p>
                  </div>
                ) : null}
                {caseState.status === "mock-analyzing" ? (
                  <AnalysisLoadingState />
                ) : (
                  <button
                    type="button"
                    disabled={!canAnalyze || isBusy}
                    onClick={handleAnalyze}
                    className="w-full rounded-xl bg-[#1d664b] px-5 py-3.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:bg-[#aeb8b2]"
                  >
                    {caseState.status === "error"
                      ? "Try mock analysis again"
                      : "Run mock analysis"}
                  </button>
                )}
                <p className="mt-3 text-center text-xs leading-5 text-[#737d77]">
                  The application server validates and discards the input in
                  memory. Mock mode makes no AI-provider call.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function hasActiveInput(caseState: CaseState): boolean {
  if (caseState.inputKind === "text") {
    return caseState.textInput.length > 0;
  }
  if (caseState.inputKind === "file") {
    return Boolean(caseState.document);
  }
  return Boolean(caseState.sampleId);
}

function getLiveMessage(caseState: CaseState): string {
  switch (caseState.status) {
    case "idle":
      return "Waiting for case input.";
    case "validating":
      return "Validating the selected file.";
    case "file-selected":
      return "Input selected. Preparing the mock analysis options.";
    case "ready":
      return "Input ready for mock analysis.";
    case "mock-analyzing":
      return "Building the mock route.";
    case "analysis-complete":
      return "Mock analysis complete.";
    case "error":
      return caseState.validationError ?? "An error occurred.";
  }
}
