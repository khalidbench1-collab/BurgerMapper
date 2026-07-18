import type { BureaucracyCategory } from "@/domain/categories";

export type SupportedLanguage = "en" | "de" | "ar";

export type InputKind = "goal" | "text" | "file" | "sample";

export type EvidenceInputKind = "none" | Exclude<InputKind, "goal">;

export type WorkflowStatus =
  | "idle"
  | "validating"
  | "file-selected"
  | "ready"
  | "mock-analyzing"
  | "needs-clarification"
  | "analysis-complete"
  | "error";

export type UrgencyLevel = "low" | "medium" | "high";

export type DocumentSource = "upload" | "sample";

export interface DocumentMetadata {
  name: string;
  mimeType: string;
  sizeBytes: number;
  selectedAt: string;
  source: DocumentSource;
}

export interface UploadedDocument {
  id: string;
  metadata: DocumentMetadata;
  file?: File;
}

export type SourceVerificationStatus =
  | "placeholder-unverified"
  | "needs-review"
  | "verified"
  | "unavailable"
  | "conflicting";

export type SourceAuthorityType =
  | "federal-law"
  | "official-service-guidance"
  | "local-administrative-practice";

export type SourceConflictStatus = "none" | "conflict";

export type RouteClaimKind =
  | "law"
  | "official-service-guidance"
  | "local-administrative-practice"
  | "document-fact"
  | "model-inference"
  | "unresolved-uncertainty";

export type ClaimSupportStatus =
  | "supported"
  | "partially-supported"
  | "unsupported"
  | "conflicting";

export interface RouteClaim {
  id: string;
  text: string;
  kind: RouteClaimKind;
  supportStatus: ClaimSupportStatus;
  sourceIds: string[];
  jurisdiction: string;
}

export type ResearchStatus =
  | "not-started"
  | "verified"
  | "partial"
  | "no-sources"
  | "conflict"
  | "unavailable";

export interface CaseResearchSummary {
  status: ResearchStatus;
  researchedAt: string | null;
  provider: "curated-official-sources" | "mock-fallback";
  limitations: string[];
  escalation: string | null;
}

export interface DeadlineProvenance {
  kind: "document-fact" | "official-source" | "user-provided" | "unknown";
  sourceIds: string[];
  confirmationRequired: boolean;
}

export interface SourceReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  domain: string;
  accessedAt: string | null;
  supports: string[];
  verificationStatus: SourceVerificationStatus;
  supportedClaimIds?: string[];
  authorityType?: SourceAuthorityType;
  jurisdiction?: string;
  conflictStatus?: SourceConflictStatus;
  httpStatus?: number;
}

export interface RequiredDocument {
  id: string;
  title: string;
  description: string;
  status: "required" | "depends-on-answer";
}

export type NextStepStatus = "ready" | "needs-answer" | "not-started";

export interface NextStep {
  order: number;
  title: string;
  description: string;
  responsibleParty: string;
  timing: string;
  status: NextStepStatus;
  officialSourceIds: string[];
  claimIds?: string[];
}

export type ClarificationAnswerId = string;

export interface ClarificationOption {
  id: ClarificationAnswerId;
  label: string;
  routeImpact: string;
}

export interface ClarificationQuestion {
  id: string;
  prompt: string;
  reason: string;
  options: ClarificationOption[];
  selectedAnswerId: ClarificationAnswerId | null;
}

export interface CaseAnalysis {
  id: string;
  documentTitle: string;
  issuingAuthority: string;
  documentType: string;
  documentLanguage: string;
  detectedDate: string;
  detectedDeadline: string;
  urgency: UrgencyLevel;
  summary: string;
  whatTheAuthorityWants: string;
  requiredDocuments: RequiredDocument[];
  missingInformation: string[];
  clarificationQuestion: ClarificationQuestion;
  nextSteps: NextStep[];
  officialSources: SourceReference[];
  routeClaims?: RouteClaim[];
  research?: CaseResearchSummary;
  deadlineProvenance?: DeadlineProvenance;
  disclaimer: string;
  generatedAt: string;
  outputLanguage: SupportedLanguage;
  inputKind: InputKind;
  category: BureaucracyCategory | null;
  mockContext: string;
  isMock: boolean;
}

interface BaseCaseInput {
  category?: BureaucracyCategory;
  outputLanguage: SupportedLanguage;
  goal?: string;
  clarificationResolution?: ClarificationResolution;
}

export interface ClarificationResolution {
  questionId: string;
  questionPrompt: string;
  questionReason: string;
  answerId: ClarificationAnswerId;
  answerLabel: string;
  options: ClarificationOption[];
}

export type CaseInput =
  | (BaseCaseInput & {
      kind: "goal";
      goal: string;
    })
  | (BaseCaseInput & {
      kind: "text";
      text: string;
    })
  | (BaseCaseInput & {
      kind: "file";
      document: UploadedDocument;
    })
  | (BaseCaseInput & {
      kind: "sample";
      sampleId: string;
    });

export interface DocumentAnalysisService {
  analyzeDocument(input: CaseInput): Promise<CaseAnalysis>;
}

export interface CaseState {
  status: WorkflowStatus;
  inputKind: EvidenceInputKind;
  category: BureaucracyCategory | null;
  goalInput: string;
  textInput: string;
  document: UploadedDocument | null;
  sampleId: string | null;
  outputLanguage: SupportedLanguage;
  analysis: CaseAnalysis | null;
  validationError: string | null;
}
