import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseAnalysis,
  CaseInput,
  ClarificationAnswerId,
  InputKind,
  SupportedLanguage,
} from "@/domain/case";

export type CaseProfileStatus = "building" | "route-ready";
export type ProfileSufficiencyState = "needs-clarification" | "sufficient";

export interface CaseGoal {
  text: string;
  source: "user" | "workflow-default";
}

export interface CaseProfileField {
  id: string;
  label: string;
  value: string;
  source: "user" | "mock-scenario";
}

export interface CaseEvidenceReference {
  kind: Exclude<InputKind, "goal">;
  label: string;
  mimeType?: string;
  sizeBytes?: number;
  contentRetained: false;
}

export interface CaseBuilderAnswer {
  questionId: string;
  answerId: ClarificationAnswerId;
  label: string;
  routeImpact: string;
  answeredAt: string;
}

export interface CaseProfileUncertainty {
  id: string;
  description: string;
  status: "unresolved";
}

export interface ProfileSufficiency {
  state: ProfileSufficiencyState;
  reason: string;
  nextQuestionId: string | null;
}

export interface CaseProfileCorrection {
  id: string;
  field: "goal" | "category" | "clarification-answer";
  summary: string;
  correctedAt: string;
}

export interface CaseProfile {
  id: string;
  goal: CaseGoal;
  category: BureaucracyCategory | null;
  evidence: CaseEvidenceReference[];
  knownFacts: CaseProfileField[];
  answers: CaseBuilderAnswer[];
  uncertainties: CaseProfileUncertainty[];
  outputLanguage: SupportedLanguage;
  sufficiency: ProfileSufficiency;
  askedQuestionIds: string[];
  correctionHistory: CaseProfileCorrection[];
  status: CaseProfileStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CaseBuilderResult {
  profile: CaseProfile;
  baseAnalysis: CaseAnalysis;
  analysis: CaseAnalysis;
}

export interface CaseBuilderService {
  buildCase(input: CaseInput, signal?: AbortSignal): Promise<CaseBuilderResult>;
}

export type CaseProfileContextCorrection = Pick<
  CaseProfileCorrection,
  "field" | "summary"
>;
