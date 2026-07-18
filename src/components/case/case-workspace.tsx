"use client";

import { useEffect, useRef, useState } from "react";

import { AnalysisLoadingState } from "@/components/case/analysis-loading-state";
import { AnalysisResult } from "@/components/case/analysis-result";
import { CaseProfileSummary } from "@/components/case/case-profile-summary";
import { CategorySelector } from "@/components/case/category-selector";
import { ClarificationCard } from "@/components/case/clarification-card";
import { DocumentDropzone } from "@/components/case/document-dropzone";
import { GoalInputPanel } from "@/components/case/goal-input-panel";
import { InputMethodSelector } from "@/components/case/input-method-selector";
import { IntakeProgress } from "@/components/case/intake-progress";
import { LanguageSelector } from "@/components/case/language-selector";
import { FICTIONAL_SAMPLE_ID, SampleInputPanel } from "@/components/case/sample-input-panel";
import { SelectedDocumentCard } from "@/components/case/selected-document-card";
import { TextInputPanel } from "@/components/case/text-input-panel";
import type { CaseAnalysisErrorCode } from "@/domain/analysis-api";
import type { BureaucracyCategory } from "@/domain/categories";
import type { CaseBuilderResult, CaseProfileContextCorrection } from "@/domain/case-profile";
import type {
  CaseInput,
  CaseState,
  ClarificationAnswerId,
  EvidenceInputKind,
  SupportedLanguage,
} from "@/domain/case";
import {
  createFileCaseInput,
  createGoalCaseInput,
  createSampleCaseInput,
  createTextCaseInput,
} from "@/lib/case-input";
import { createUploadedDocument, validateDocumentFile } from "@/lib/file-validation";
import { validateCaseGoal } from "@/lib/goal-validation";
import { validatePastedText } from "@/lib/text-validation";
import {
  answerCaseBuilderQuestion,
  categoryCorrection,
  mergeCaseProfileCorrections,
  ServerCaseBuilderService,
} from "@/services/case-builder";
import { AnalysisApiError } from "@/services/server-document-analysis";

const caseBuilderService = new ServerCaseBuilderService();

interface RequestErrorState {
  code: CaseAnalysisErrorCode;
  message: string;
  requestId: string | null;
}

function createInitialState(category: BureaucracyCategory | null = null): CaseState {
  return {
    status: "idle",
    inputKind: "none",
    category,
    goalInput: "",
    textInput: "",
    document: null,
    sampleId: null,
    outputLanguage: "en",
    analysis: null,
    validationError: null,
  };
}

export function CaseWorkspace({ initialCategory = null }: { initialCategory?: BureaucracyCategory | null }) {
  const [caseState, setCaseState] = useState<CaseState>(() => createInitialState(initialCategory));
  const [builderResult, setBuilderResult] = useState<CaseBuilderResult | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<RequestErrorState | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const requestId = useRef(0);
  const activeRequestController = useRef<AbortController | null>(null);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    activeRequestController.current?.abort();
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

  function handleInputModeChange(nextKind: EvidenceInputKind) {
    if (nextKind === caseState.inputKind) return;
    if (hasActiveEvidence(caseState) && !window.confirm("Switching evidence methods will clear the current private evidence. Continue?")) return;
    clearPendingWork();
    setCaseState((current) => ({
      ...current,
      status: validateOptionalGoal(current.goalInput) ? "ready" : "idle",
      inputKind: nextKind,
      textInput: "",
      document: null,
      sampleId: null,
      analysis: null,
      validationError: null,
    }));
  }

  function handleGoalChange(goalInput: string) {
    const validation = goalInput.trim() ? validateCaseGoal(goalInput) : null;
    setGoalError(validation && !validation.valid ? validation.error : null);
    setRequestError(null);
    setCaseState((current) => ({
      ...current,
      goalInput,
      status: validateOptionalGoal(goalInput) || hasReadyEvidence(current, goalInput) ? "ready" : "idle",
    }));
  }

  function handleCategoryChange(category: BureaucracyCategory | null) {
    setRequestError(null);
    setCaseState((current) => ({ ...current, category }));
  }

  function handleTextChange(textInput: string) {
    const validation = textInput.trim() ? validatePastedText(textInput) : null;
    setRequestError(null);
    setCaseState((current) => ({
      ...current,
      textInput,
      status: validation?.valid ? "ready" : validateOptionalGoal(current.goalInput) ? "ready" : "idle",
      validationError: validation && !validation.valid ? validation.error : null,
    }));
  }

  function handleFileSelected(file: File) {
    clearPendingWork();
    setCaseState((current) => ({ ...current, status: "validating", document: null, analysis: null, validationError: null }));
    queue(() => {
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        setCaseState((current) => ({ ...current, status: "error", validationError: validation.error }));
        return;
      }
      setCaseState((current) => ({ ...current, status: "file-selected", document: createUploadedDocument(file), validationError: null }));
      queue(() => setCaseState((current) => ({ ...current, status: "ready" })), 180);
    }, 220);
  }

  function handleSampleSelected() {
    clearPendingWork();
    setCaseState((current) => ({ ...current, status: "file-selected", sampleId: FICTIONAL_SAMPLE_ID, analysis: null, validationError: null }));
    queue(() => setCaseState((current) => ({ ...current, status: "ready" })), 180);
  }

  function handleLanguageChange(outputLanguage: SupportedLanguage) {
    setRequestError(null);
    setCaseState((current) => ({ ...current, outputLanguage }));
  }

  function handleRemoveDocument() {
    clearPendingWork();
    setCaseState((current) => ({ ...current, status: validateOptionalGoal(current.goalInput) ? "ready" : "idle", document: null, analysis: null, validationError: null }));
  }

  function handleStartOver() {
    clearPendingWork();
    setBuilderResult(null);
    setShowQuestion(false);
    setGoalError(null);
    setCaseState(createInitialState());
  }

  function buildActiveInput(goalOverride?: string, categoryOverride?: BureaucracyCategory | null): CaseInput | null {
    const category = categoryOverride === undefined ? caseState.category : categoryOverride;
    const rawGoal = goalOverride ?? caseState.goalInput;
    const goalValidation = rawGoal.trim() ? validateCaseGoal(rawGoal) : null;
    if (goalValidation && !goalValidation.valid) {
      setGoalError(goalValidation.error);
      return null;
    }
    const goal = goalValidation?.valid ? goalValidation.normalizedGoal : null;
    const { outputLanguage } = caseState;

    if (caseState.inputKind === "none") {
      const result = createGoalCaseInput(rawGoal, outputLanguage, category);
      if (!result.valid) {
        setGoalError(result.error);
        return null;
      }
      return result.input;
    }
    if (caseState.inputKind === "text") {
      const result = createTextCaseInput(caseState.textInput, outputLanguage, category, goal);
      if (!result.valid) {
        setCaseState((current) => ({ ...current, status: "error", validationError: result.error }));
        return null;
      }
      return result.input;
    }
    if (caseState.inputKind === "file" && caseState.document) {
      return createFileCaseInput(caseState.document, outputLanguage, category, goal);
    }
    if (caseState.inputKind === "sample" && caseState.sampleId) {
      return createSampleCaseInput(caseState.sampleId, outputLanguage, category, goal);
    }
    return null;
  }

  async function runCaseBuilder(input: CaseInput, previousResult?: CaseBuilderResult, corrections: CaseProfileContextCorrection[] = []) {
    if (caseState.status === "mock-analyzing" || activeRequestController.current) return;
    clearPendingWork();
    const controller = new AbortController();
    activeRequestController.current = controller;
    const activeRequest = requestId.current + 1;
    requestId.current = activeRequest;
    setCaseState((current) => ({ ...current, status: "mock-analyzing", validationError: null }));
    setRequestError(null);

    try {
      let result = await caseBuilderService.buildCase(input, controller.signal);
      if (previousResult && corrections.length) {
        result = mergeCaseProfileCorrections(result, previousResult.profile, corrections);
      }
      if (requestId.current !== activeRequest) return;
      setBuilderResult(result);
      setShowQuestion(true);
      setCaseState((current) => ({ ...current, goalInput: input.goal ?? current.goalInput, category: input.category ?? null, analysis: result.analysis, status: "needs-clarification" }));
    } catch (error) {
      if (controller.signal.aborted || requestId.current !== activeRequest) return;
      const apiError = error instanceof AnalysisApiError ? error : new AnalysisApiError("INTERNAL_ERROR", null);
      setRequestError({ code: apiError.code, message: apiError.message, requestId: apiError.requestId });
      setCaseState((current) => ({ ...current, status: "error", validationError: null }));
    } finally {
      if (activeRequestController.current === controller) activeRequestController.current = null;
    }
  }

  function handleAnalyze() {
    const input = buildActiveInput();
    if (input) void runCaseBuilder(input);
  }

  function handleClarification(answer: ClarificationAnswerId) {
    setBuilderResult((current) => {
      if (!current) return current;
      const updated = answerCaseBuilderQuestion(current, answer);
      setCaseState((state) => ({ ...state, analysis: updated.analysis, status: "analysis-complete" }));
      return updated;
    });
    setShowQuestion(false);
  }

  function handleSaveContext(goal: string, category: BureaucracyCategory | null) {
    if (!builderResult) return;
    const corrections: CaseProfileContextCorrection[] = [];
    if (goal !== builderResult.profile.goal.text) corrections.push({ field: "goal", summary: "Goal updated; the previous clarification answer was cleared." });
    const categoryChange = categoryCorrection(builderResult.profile.category, category);
    if (categoryChange) corrections.push(categoryChange);
    const input = buildActiveInput(goal, category);
    if (input) void runCaseBuilder(input, builderResult, corrections);
  }

  const isBusy = caseState.status === "validating" || caseState.status === "mock-analyzing";
  const canAnalyze = canBuildCase(caseState) && !isBusy;
  const liveMessage = requestError?.message ?? getLiveMessage(caseState);

  return (
    <div className="space-y-6">
      <IntakeProgress status={showQuestion ? "needs-clarification" : caseState.status} />
      <p aria-live="polite" aria-atomic="true" className="sr-only">{liveMessage}</p>

      {builderResult ? (
        <div className="space-y-5">
          <div className="flex justify-end print:hidden">
            <button type="button" onClick={handleStartOver} disabled={isBusy} className="rounded-xl border border-[#bfc7c2] bg-white px-4 py-2.5 text-sm font-semibold text-[#35443c] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:opacity-60">Start over</button>
          </div>
          <CaseProfileSummary key={builderResult.profile.id} profile={builderResult.profile} disabled={isBusy} onSaveContext={handleSaveContext} onChangeAnswer={() => { setShowQuestion(true); setCaseState((current) => ({ ...current, status: "needs-clarification" })); }} />
          {isBusy ? <AnalysisLoadingState /> : null}
          {showQuestion && !isBusy ? (
            <div dir={builderResult.analysis.outputLanguage === "ar" ? "rtl" : "ltr"} lang={builderResult.analysis.outputLanguage}>
              <ClarificationCard analysis={builderResult.analysis} onAnswer={handleClarification} />
              <p className="mt-3 text-sm leading-6 text-[#68736d]" dir="ltr">Mock mode uses one deterministic route-changing question. It has not interpreted your goal or evidence.</p>
            </div>
          ) : null}
          {builderResult.profile.sufficiency.state === "sufficient" && !isBusy ? (
            <AnalysisResult analysis={builderResult.analysis} onAnswer={handleClarification} onStartOver={handleStartOver} showClarification={false} />
          ) : null}
        </div>
      ) : (
        <>
          <GoalInputPanel value={caseState.goalInput} error={goalError} onChange={handleGoalChange} disabled={isBusy} />
          <CategorySelector value={caseState.category} onChange={handleCategoryChange} disabled={isBusy} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
            <section aria-labelledby="evidence-heading" className="rounded-[1.5rem] border border-[#d6dbd7] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.06)] sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">Optional evidence</p>
              <h2 id="evidence-heading" className="mt-2 text-xl font-semibold text-[#1d2b24]">Add context if you have it</h2>
              <p className="mt-2 text-sm leading-6 text-[#68736d]">Continue with your goal alone, paste a message, upload a PDF or image, or use the fictional sample.</p>
              <div className="mt-6"><InputMethodSelector value={caseState.inputKind} onChange={handleInputModeChange} disabled={isBusy} /></div>
              <div className="mt-6 border-t border-[#e0e4e0] pt-6">
                {caseState.inputKind === "none" ? <p className="rounded-xl bg-[#f3f7f4] p-4 text-sm leading-6 text-[#58655e]">No document is required. BurgerMapper can build a fictional mock route from your goal.</p> : null}
                {caseState.inputKind === "text" ? <TextInputPanel value={caseState.textInput} error={caseState.validationError} onChange={handleTextChange} disabled={isBusy} /> : null}
                {caseState.inputKind === "file" ? (caseState.document ? <SelectedDocumentCard document={caseState.document} onRemove={handleRemoveDocument} disabled={isBusy} /> : <DocumentDropzone disabled={isBusy} error={caseState.validationError} onFileSelected={handleFileSelected} />) : null}
                {caseState.inputKind === "sample" ? <SampleInputPanel selected={Boolean(caseState.sampleId)} onSelect={handleSampleSelected} disabled={isBusy} /> : null}
              </div>
            </section>
            <aside className="space-y-5 rounded-[1.5rem] border border-[#d6dbd7] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.06)] sm:p-7">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">Output</p><h2 className="mt-2 text-xl font-semibold text-[#1d2b24]">Choose your route language</h2></div>
              <LanguageSelector value={caseState.outputLanguage} onChange={handleLanguageChange} disabled={isBusy} />
              <div className="border-t border-[#e0e4e0] pt-5">
                {requestError ? <div role="alert" data-testid="analysis-api-error" className="mb-4 rounded-xl border border-[#e3b4a8] bg-[#fff7f4] p-4 text-sm text-[#7d3325]"><p className="font-semibold">{requestError.message}</p><p className="mt-1 text-xs">Error code: {requestError.code}{requestError.requestId ? ` · Request reference: ${requestError.requestId}` : ""}</p></div> : null}
                {caseState.status === "mock-analyzing" ? <AnalysisLoadingState /> : <button type="button" disabled={!canAnalyze} onClick={handleAnalyze} className="w-full rounded-xl bg-[#1d664b] px-5 py-3.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:bg-[#aeb8b2]">{caseState.status === "error" ? "Try building the mock case again" : "Build mock case"}</button>}
                <p className="mt-3 text-center text-xs leading-5 text-[#737d77]">The application server validates and discards inputs in memory. Mock mode makes no AI-provider call.</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function hasActiveEvidence(state: CaseState): boolean {
  if (state.inputKind === "text") return state.textInput.length > 0;
  if (state.inputKind === "file") return Boolean(state.document);
  if (state.inputKind === "sample") return Boolean(state.sampleId);
  return false;
}

function validateOptionalGoal(goal: string): boolean {
  return goal.trim().length > 0 && validateCaseGoal(goal).valid;
}

function hasReadyEvidence(state: CaseState, goal = state.goalInput): boolean {
  if (goal.trim() && !validateCaseGoal(goal).valid) return false;
  if (state.inputKind === "text") return validatePastedText(state.textInput).valid;
  if (state.inputKind === "file") return Boolean(state.document);
  if (state.inputKind === "sample") return Boolean(state.sampleId);
  return false;
}

function canBuildCase(state: CaseState): boolean {
  if (state.goalInput.trim() && !validateCaseGoal(state.goalInput).valid) return false;
  return state.inputKind === "none" ? validateOptionalGoal(state.goalInput) : hasReadyEvidence(state);
}

function getLiveMessage(state: CaseState): string {
  switch (state.status) {
    case "idle": return "Waiting for a goal or optional evidence.";
    case "validating": return "Validating the selected file.";
    case "file-selected": return "Evidence selected.";
    case "ready": return "Case context ready.";
    case "mock-analyzing": return "Building the structured mock case profile.";
    case "needs-clarification": return "One route-changing detail is needed.";
    case "analysis-complete": return "Mock route ready.";
    case "error": return state.validationError ?? "An error occurred.";
  }
}
