export type SupportedLanguage = "en" | "de" | "ar";

export type WorkflowStatus =
  | "idle"
  | "validating"
  | "file-selected"
  | "ready"
  | "mock-analyzing"
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
  | "verified";

export interface SourceReference {
  id: string;
  title: string;
  publisher: string;
  url: string;
  domain: string;
  accessedAt: string | null;
  supports: string[];
  verificationStatus: SourceVerificationStatus;
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
}

export type ClarificationAnswerId = "employed" | "self-employed" | "both";

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
  disclaimer: string;
  generatedAt: string;
  outputLanguage: SupportedLanguage;
  isMock: true;
}

export interface AnalysisInput {
  document: UploadedDocument;
  outputLanguage: SupportedLanguage;
}

export interface DocumentAnalysisService {
  analyzeDocument(input: AnalysisInput): Promise<CaseAnalysis>;
}

export interface CaseState {
  status: WorkflowStatus;
  document: UploadedDocument | null;
  outputLanguage: SupportedLanguage;
  analysis: CaseAnalysis | null;
  validationError: string | null;
}
