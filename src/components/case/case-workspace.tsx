"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnalysisLoadingState } from "@/components/case/analysis-loading-state";
import { AnalysisResult } from "@/components/case/analysis-result";
import { CaseProfileSummary } from "@/components/case/case-profile-summary";
import { ClarificationCard } from "@/components/case/clarification-card";
import { GoalInputPanel } from "@/components/case/goal-input-panel";
import { IntakeProgress } from "@/components/case/intake-progress";
import { LanguageMenu } from "@/components/case/language-menu";
import type { CaseAnalysisErrorCode } from "@/domain/analysis-api";
import type { BureaucracyCategory } from "@/domain/categories";
import type { CaseBuilderResult, CaseProfileContextCorrection } from "@/domain/case-profile";
import type {
  CaseInput,
  CaseState,
  ClarificationAnswerId,
  ClarificationAnswerSummary,
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
  categoryCorrection,
  mergeCaseProfileCorrections,
  ServerCaseBuilderService,
} from "@/services/case-builder";
import { AnalysisApiError } from "@/services/server-document-analysis";
import { ServerDocumentAnalysisService } from "@/services/server-document-analysis";
import {
  applyResearchToAnalysis,
  markResearchUnavailable,
  ServerSourceResearchService,
} from "@/services/source-research";

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

export function CaseWorkspace({
  initialCategory = null,
}: {
  initialCategory?: BureaucracyCategory | null;
}) {
  const caseBuilderService = useMemo(
    () => new ServerCaseBuilderService(new ServerDocumentAnalysisService(true)),
    [],
  );
  const sourceResearchService = useMemo(() => new ServerSourceResearchService(), []);
  const [caseState, setCaseState] = useState<CaseState>(() => createInitialState(initialCategory));
  const [builderResult, setBuilderResult] = useState<CaseBuilderResult | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<RequestErrorState | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const requestId = useRef(0);
  const activeRequestController = useRef<AbortController | null>(null);
  const answerHistory = useRef<ClarificationAnswerSummary[]>([]);

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
    setIsResearching(false);
    setRequestError(null);
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

  function handleFileSelected(file: File) {
    clearPendingWork();
    setCaseState((current) => ({ ...current, status: "validating", document: null, analysis: null, validationError: null }));
    queue(() => {
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        setCaseState((current) => ({ ...current, status: "error", validationError: validation.error }));
        return;
      }
      setCaseState((current) => ({ ...current, status: "file-selected", inputKind: "file", document: createUploadedDocument(file), validationError: null }));
      queue(() => setCaseState((current) => ({ ...current, status: "ready" })), 180);
    }, 220);
  }

  function handleLanguageChange(outputLanguage: SupportedLanguage) {
    setRequestError(null);
    setCaseState((current) => ({ ...current, outputLanguage }));
  }

  function handleRemoveDocument() {
    clearPendingWork();
    setCaseState((current) => ({ ...current, status: validateOptionalGoal(current.goalInput) ? "ready" : "idle", inputKind: "none", document: null, analysis: null, validationError: null }));
  }

  function handleStartOver() {
    clearPendingWork();
    setBuilderResult(null);
    setShowQuestion(false);
    setGoalError(null);
    answerHistory.current = [];
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
      const needsClarification = result.profile.sufficiency.state === "needs-clarification";
      if (!needsClarification) {
        setIsResearching(true);
        result = await addOfficialResearch(result, controller.signal);
      }
      if (requestId.current !== activeRequest) return;
      setBuilderResult(result);
      setShowQuestion(needsClarification);
      setCaseState((current) => ({ ...current, goalInput: input.goal ?? current.goalInput, category: input.category ?? null, analysis: result.analysis, status: needsClarification ? "needs-clarification" : "analysis-complete" }));
    } catch (error) {
      if (controller.signal.aborted || requestId.current !== activeRequest) return;
      const apiError = error instanceof AnalysisApiError ? error : new AnalysisApiError("INTERNAL_ERROR", null);
      setRequestError({ code: apiError.code, message: apiError.message, requestId: apiError.requestId });
      setCaseState((current) => ({ ...current, status: "error", validationError: null }));
    } finally {
      setIsResearching(false);
      if (activeRequestController.current === controller) activeRequestController.current = null;
    }
  }

  function handleAnalyze() {
    const input = buildActiveInput();
    if (!input) return;
    answerHistory.current = [];
    void runCaseBuilder(input);
  }

  /**
   * Records an answer and returns the answers given to *earlier* questions.
   *
   * Only a re-answer of the question just asked ("Change this answer") replaces
   * its entry. Matching against any earlier entry would silently truncate the
   * history when the model reuses a question id for a genuinely new question,
   * which resets the question budget and lets the exchange run on.
   */
  function recordAnswer(questionId: string, questionPrompt: string, answerLabel: string): ClarificationAnswerSummary[] {
    const last = answerHistory.current[answerHistory.current.length - 1];
    const isCorrectionOfLast = Boolean(last && last.questionId === questionId && last.questionPrompt === questionPrompt);
    const prior = isCorrectionOfLast
      ? answerHistory.current.slice(0, -1)
      : answerHistory.current.slice();
    answerHistory.current = [...prior, { questionId, questionPrompt, answerLabel }];
    return prior;
  }

  function handleClarificationText(rawText: string) {
    const text = rawText.trim().slice(0, 500);
    if (!text) return;
    if (!builderResult) return;
    const question = builderResult.analysis.clarificationQuestion;
    const input = buildActiveInput();
    if (!input) return;
    const previousAnswer = builderResult.profile.answers.find((item) => item.questionId === question.id);
    const corrections: CaseProfileContextCorrection[] = previousAnswer && previousAnswer.label !== text
      ? [{ field: "clarification-answer", summary: "Clarification answer changed; the route was rebuilt." }]
      : [];
    void runCaseBuilder({
      ...input,
      clarificationResolution: {
        questionId: question.id,
        questionPrompt: question.prompt,
        questionReason: question.reason,
        answerId: "custom-answer",
        answerLabel: text,
        options: question.options,
        answerHistory: recordAnswer(question.id, question.prompt, text),
      },
    }, builderResult, corrections);
  }

  function handleClarification(answer: ClarificationAnswerId) {
    if (!builderResult) return;
    const question = builderResult.analysis.clarificationQuestion;
    const option = question.options.find((candidate) => candidate.id === answer);
    const input = buildActiveInput();
    if (!option || !input) return;
    const previousAnswer = builderResult.profile.answers.find((item) => item.questionId === question.id);
    const corrections: CaseProfileContextCorrection[] = previousAnswer && previousAnswer.answerId !== answer
      ? [{ field: "clarification-answer", summary: "Clarification answer changed; the route was rebuilt." }]
      : [];
    void runCaseBuilder({
      ...input,
      clarificationResolution: {
        questionId: question.id,
        questionPrompt: question.prompt,
        questionReason: question.reason,
        answerId: option.id,
        answerLabel: option.label,
        options: question.options,
        answerHistory: recordAnswer(question.id, question.prompt, option.label),
      },
    }, builderResult, corrections);
  }

  async function addOfficialResearch(result: CaseBuilderResult, signal: AbortSignal): Promise<CaseBuilderResult> {
    try {
      const research = await sourceResearchService.research(result.profile, result.analysis, signal);
      return { ...result, analysis: applyResearchToAnalysis(result.analysis, research) };
    } catch {
      if (signal.aborted) throw new DOMException("Research cancelled", "AbortError");
      return { ...result, analysis: markResearchUnavailable(result.analysis) };
    }
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

  const isBusy = caseState.status === "validating" || caseState.status === "mock-analyzing" || isResearching;
  const canAnalyze = canBuildCase(caseState) && !isBusy;
  const liveMessage = requestError?.message ?? (isResearching ? "Checking official sources for the ready case profile." : getLiveMessage(caseState));

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
          {isBusy ? <AnalysisLoadingState message={isResearching ? "Checking official sources and connecting them to route claims…" : undefined} /> : null}
          {showQuestion && !isBusy ? (
            <div dir={builderResult.analysis.outputLanguage === "ar" ? "rtl" : "ltr"} lang={builderResult.analysis.outputLanguage}>
              <ClarificationCard analysis={builderResult.analysis} onAnswer={handleClarification} onAnswerText={handleClarificationText} />
              <p className="mt-3 text-sm leading-6 text-[#68736d]" dir="ltr">{"OpenAI identified one question whose answer can change the route."}</p>
            </div>
          ) : null}
          {builderResult.profile.sufficiency.state === "sufficient" && !isBusy ? (
            <AnalysisResult analysis={builderResult.analysis} onAnswer={handleClarification} onStartOver={handleStartOver} showClarification={false} />
          ) : null}
        </div>
      ) : (
        <>
          <GoalInputPanel
            value={caseState.goalInput}
            error={goalError}
            onChange={handleGoalChange}
            disabled={isBusy}
            document={caseState.document}
            uploadError={caseState.validationError}
            onFileSelected={handleFileSelected}
            onRemoveDocument={handleRemoveDocument}
            action={
              <div>
                {requestError ? <div role="alert" data-testid="analysis-api-error" className="mb-4 rounded-xl border border-[#e3b4a8] bg-[#fff7f4] p-4 text-sm text-[#7d3325]"><p className="font-semibold">{requestError.message}</p><p className="mt-1 text-xs">Error code: {requestError.code}{requestError.requestId ? ` · Request reference: ${requestError.requestId}` : ""}</p></div> : null}
                {caseState.status === "mock-analyzing" ? <AnalysisLoadingState /> : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button type="button" disabled={!canAnalyze} onClick={handleAnalyze} className="w-full rounded-xl bg-[#1d664b] px-8 py-3.5 text-sm font-semibold text-white shadow-sm outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:bg-[#aeb8b2] sm:w-auto">{caseState.status === "error" ? "Try again" : "Guide me"}</button>
                    <LanguageMenu value={caseState.outputLanguage} onChange={handleLanguageChange} disabled={isBusy} />
                  </div>
                )}
                <p className="mt-3 text-xs leading-5 text-[#737d77]">{"Selecting Guide me sends the minimum required case content to OpenAI for analysis. It is not intentionally stored."}</p>
              </div>
            }
          />
        </>
      )}
    </div>
  );
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
    case "mock-analyzing": return "Analyzing the case with OpenAI.";
    case "needs-clarification": return "One route-changing detail is needed.";
    case "analysis-complete": return "Route ready.";
    case "error": return state.validationError ?? "An error occurred.";
  }
}
