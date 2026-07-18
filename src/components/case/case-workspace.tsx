"use client";

import { useEffect, useRef, useState } from "react";

import { AnalysisLoadingState } from "@/components/case/analysis-loading-state";
import { AnalysisResult } from "@/components/case/analysis-result";
import { DocumentDropzone } from "@/components/case/document-dropzone";
import { IntakeProgress } from "@/components/case/intake-progress";
import { LanguageSelector } from "@/components/case/language-selector";
import { SelectedDocumentCard } from "@/components/case/selected-document-card";
import type {
  CaseState,
  ClarificationAnswerId,
  SupportedLanguage,
} from "@/domain/case";
import {
  createSampleDocument,
  createUploadedDocument,
  validateDocumentFile,
} from "@/lib/file-validation";
import {
  adaptAnalysisToClarification,
  analyzeDocument,
} from "@/services/document-analysis";

const initialState: CaseState = {
  status: "idle",
  document: null,
  outputLanguage: "en",
  analysis: null,
  validationError: null,
};

export function CaseWorkspace() {
  const [caseState, setCaseState] = useState<CaseState>(initialState);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const requestId = useRef(0);

  useEffect(() => {
    return () => timers.current.forEach((timer) => clearTimeout(timer));
  }, []);

  function queue(callback: () => void, delayMs: number) {
    const timer = setTimeout(callback, delayMs);
    timers.current.push(timer);
  }

  function clearPendingWork() {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    requestId.current += 1;
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
      document: createSampleDocument(),
      analysis: null,
      validationError: null,
    }));
    queue(() => {
      setCaseState((current) => ({ ...current, status: "ready" }));
    }, 180);
  }

  function handleLanguageChange(outputLanguage: SupportedLanguage) {
    setCaseState((current) => ({ ...current, outputLanguage }));
  }

  function handleRemoveDocument() {
    clearPendingWork();
    setCaseState((current) => ({
      ...initialState,
      outputLanguage: current.outputLanguage,
    }));
  }

  function handleStartOver() {
    clearPendingWork();
    setCaseState(initialState);
  }

  async function handleAnalyze() {
    if (
      !caseState.document ||
      (caseState.status !== "ready" && caseState.status !== "error")
    )
      return;

    const activeRequest = requestId.current + 1;
    requestId.current = activeRequest;
    setCaseState((current) => ({
      ...current,
      status: "mock-analyzing",
      validationError: null,
    }));

    try {
      const analysis = await analyzeDocument({
        document: caseState.document,
        outputLanguage: caseState.outputLanguage,
      });
      if (requestId.current !== activeRequest) return;

      setCaseState((current) => ({
        ...current,
        status: "analysis-complete",
        analysis,
      }));
    } catch {
      if (requestId.current !== activeRequest) return;
      setCaseState((current) => ({
        ...current,
        status: "error",
        validationError: "The mock analysis could not be created. Please try again.",
      }));
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

  const liveMessage = getLiveMessage(caseState);
  const hasDocument = Boolean(caseState.document);
  const isBusy = caseState.status === "validating" || caseState.status === "mock-analyzing";

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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
          <section aria-labelledby="document-step-heading" className="rounded-[1.5rem] border border-[#d6dbd7] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.06)] sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
              Step 1
            </p>
            <h2 id="document-step-heading" className="mt-2 text-xl font-semibold text-[#1d2b24]">
              Add an official letter
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#68736d]">
              Select a German official letter or use the fictional sample. Phase 1 does not inspect its contents.
            </p>

            <div className="mt-6">
              {hasDocument && caseState.document ? (
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
                  onSampleSelected={handleSampleSelected}
                />
              )}
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
              disabled={!hasDocument || isBusy}
            />

            <div className="border-t border-[#e0e4e0] pt-5">
              {caseState.status === "mock-analyzing" ? (
                <AnalysisLoadingState />
              ) : (
                <button
                  type="button"
                  disabled={
                    !hasDocument ||
                    caseState.status === "file-selected" ||
                    caseState.status === "validating"
                  }
                  onClick={handleAnalyze}
                  className="w-full rounded-xl bg-[#1d664b] px-5 py-3.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:bg-[#aeb8b2]"
                >
                  {caseState.status === "error"
                    ? "Try mock analysis again"
                    : "Run mock analysis"}
                </button>
              )}
              <p className="mt-3 text-center text-xs leading-5 text-[#737d77]">
                Uses a fixed fictional scenario. No AI call is made.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function getLiveMessage(caseState: CaseState): string {
  switch (caseState.status) {
    case "idle":
      return "No document selected.";
    case "validating":
      return "Validating the selected file.";
    case "file-selected":
      return "Document selected. Preparing the mock analysis options.";
    case "ready":
      return "Document ready for mock analysis.";
    case "mock-analyzing":
      return "Building the mock route.";
    case "analysis-complete":
      return "Mock analysis complete.";
    case "error":
      return caseState.validationError ?? "An error occurred.";
  }
}
