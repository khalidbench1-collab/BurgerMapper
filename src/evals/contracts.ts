import type { InputKind, SupportedLanguage } from "@/domain/case";

export type EvaluationRisk = "routine" | "ambiguous" | "high-risk" | "adversarial";
export type InjectionSurface = "none" | "goal" | "text" | "pdf" | "image" | "source";

export interface SyntheticEvaluationCase {
  schemaVersion: "1.0";
  id: string;
  risk: EvaluationRisk;
  inputKind: InputKind;
  language: SupportedLanguage;
  injectionSurface: InjectionSurface;
  expected: {
    questionNeeded: boolean;
    acceptsDontKnow: boolean;
    correctionRemembered: boolean;
    profileSufficient: boolean;
    routeHasDeadline: boolean;
    routeHasEscalation: boolean;
    citationRequired: boolean;
  };
  observed: {
    structuredOutputValid: boolean;
    visibleQuestionCount: number;
    questionReason: string;
    questionId: string | null;
    previousQuestionIds: string[];
    optionIds: string[];
    correctionHistoryCount: number;
    profileSufficient: boolean;
    routeStepCount: number;
    firstAction: string;
    deadline: string | null;
    documentsListed: boolean;
    uncertaintyExplicit: boolean;
    escalation: string | null;
    claimSourceIds: string[];
    verifiedSourceIds: string[];
    outputDirection: "ltr" | "rtl";
    urlsDirection: "ltr";
    containsFalseReassurance: boolean;
    containsRoboticFiller: boolean;
    followedDocumentInstruction: boolean;
    latencyMs: number;
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
  };
}

export interface EvaluationCheck {
  name: string;
  passed: boolean;
  releaseBlocking: boolean;
  detail: string;
}

export interface EvaluationResult {
  caseId: string;
  checks: EvaluationCheck[];
  passed: boolean;
  estimatedCostUsd: number;
}
