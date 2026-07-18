import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseBuilderResult,
  CaseBuilderService,
  CaseEvidenceReference,
  CaseProfile,
  CaseProfileContextCorrection,
} from "@/domain/case-profile";
import type {
  CaseAnalysis,
  CaseInput,
  ClarificationAnswerId,
} from "@/domain/case";
import { adaptAnalysisToClarification } from "@/services/document-analysis";
import { ServerDocumentAnalysisService } from "@/services/server-document-analysis";

const DEFAULT_GOALS: Record<CaseInput["kind"], string> = {
  goal: "Understand what needs to happen and build the next-step route.",
  text: "Understand the pasted official message and work out what to do next.",
  file: "Understand the uploaded official document and work out what to do next.",
  sample: "Understand the fictional residence-renewal sample and prepare the next steps.",
};

export class ServerCaseBuilderService implements CaseBuilderService {
  constructor(
    private readonly analysisService = new ServerDocumentAnalysisService(),
  ) {}

  async buildCase(
    input: CaseInput,
    signal?: AbortSignal,
  ): Promise<CaseBuilderResult> {
    const analysis = await this.analysisService.analyzeDocument(input, signal);
    const profile = createMockCaseProfile(input, analysis);
    return {
      profile,
      baseAnalysis: analysis,
      analysis: buildMockRouteFromProfile(profile, analysis),
    };
  }
}

export function createMockCaseProfile(
  input: CaseInput,
  analysis: CaseAnalysis,
): CaseProfile {
  const timestamp = analysis.generatedAt;
  const question = analysis.clarificationQuestion;
  const goal = input.goal?.trim();

  return {
    id: `profile-${analysis.id}`,
    goal: {
      text: goal || DEFAULT_GOALS[input.kind],
      source: goal ? "user" : "workflow-default",
    },
    category: input.category ?? null,
    evidence: evidenceFromInput(input),
    knownFacts: [
      {
        id: "mock-authority",
        label: "Issuing authority",
        value: analysis.issuingAuthority,
        source: "mock-scenario",
      },
      {
        id: "mock-document-type",
        label: "Document type",
        value: analysis.documentType,
        source: "mock-scenario",
      },
    ],
    answers: [],
    uncertainties: analysis.missingInformation.map((description, index) => ({
      id: `uncertainty-${index + 1}`,
      description,
      status: "unresolved",
    })),
    outputLanguage: input.outputLanguage,
    sufficiency: {
      state: "needs-clarification",
      reason: question.reason,
      nextQuestionId: question.id,
    },
    askedQuestionIds: [question.id],
    correctionHistory: [],
    status: "building",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function answerCaseBuilderQuestion(
  result: CaseBuilderResult,
  answerId: ClarificationAnswerId,
  answeredAt = new Date().toISOString(),
): CaseBuilderResult {
  const question = result.baseAnalysis.clarificationQuestion;
  const option = question.options.find((candidate) => candidate.id === answerId);
  if (!option) return result;

  const previousAnswer = result.profile.answers.find(
    (answer) => answer.questionId === question.id,
  );
  const correctionHistory = [...result.profile.correctionHistory];
  if (previousAnswer && previousAnswer.answerId !== answerId) {
    correctionHistory.push({
      id: `correction-answer-${correctionHistory.length + 1}`,
      field: "clarification-answer",
      summary: `Clarification answer changed from ${previousAnswer.label} to ${option.label}.`,
      correctedAt: answeredAt,
    });
  }

  const profile: CaseProfile = {
    ...result.profile,
    answers: [
      {
        questionId: question.id,
        answerId,
        label: option.label,
        routeImpact: option.routeImpact,
        answeredAt,
      },
    ],
    correctionHistory,
    sufficiency: {
      state: "sufficient",
      reason:
        answerId === "dont-know" || answerId.startsWith("unsure-")
          ? "The route can proceed with this uncertainty recorded and a verification step."
          : "The consequential clarification is answered, so the mock route can be finalized.",
      nextQuestionId: null,
    },
    status: "route-ready",
    updatedAt: answeredAt,
  };

  return {
    profile,
    baseAnalysis: result.baseAnalysis,
    analysis: buildMockRouteFromProfile(profile, result.baseAnalysis),
  };
}

export function buildMockRouteFromProfile(
  profile: CaseProfile,
  baseAnalysis: CaseAnalysis,
): CaseAnalysis {
  const answer = profile.answers[0];
  if (!answer) {
    return {
      ...baseAnalysis,
      clarificationQuestion: {
        ...baseAnalysis.clarificationQuestion,
        options: baseAnalysis.clarificationQuestion.options.map((option) => ({
          ...option,
        })),
        selectedAnswerId: null,
      },
    };
  }
  return adaptAnalysisToClarification(baseAnalysis, answer.answerId);
}

export function mergeCaseProfileCorrections(
  rebuilt: CaseBuilderResult,
  previousProfile: CaseProfile,
  corrections: CaseProfileContextCorrection[],
  correctedAt = new Date().toISOString(),
): CaseBuilderResult {
  const correctionHistory = [
    ...previousProfile.correctionHistory,
    ...corrections.map((correction, index) => ({
      id: `correction-context-${previousProfile.correctionHistory.length + index + 1}`,
      field: correction.field,
      summary: correction.summary,
      correctedAt,
    })),
  ];

  return {
    ...rebuilt,
    profile: {
      ...rebuilt.profile,
      correctionHistory,
      createdAt: previousProfile.createdAt,
      updatedAt: correctedAt,
    },
  };
}

function evidenceFromInput(input: CaseInput): CaseEvidenceReference[] {
  if (input.kind === "goal") return [];
  if (input.kind === "text") {
    return [
      {
        kind: "text",
        label: "Pasted official message",
        contentRetained: false,
      },
    ];
  }
  if (input.kind === "sample") {
    return [
      {
        kind: "sample",
        label: "Trusted fictional residence-renewal sample",
        contentRetained: false,
      },
    ];
  }
  return [
    {
      kind: "file",
      label:
        input.document.metadata.mimeType === "application/pdf"
          ? "Uploaded PDF document"
          : "Uploaded image document",
      mimeType: input.document.metadata.mimeType,
      sizeBytes: input.document.metadata.sizeBytes,
      contentRetained: false,
    },
  ];
}

export function categoryCorrection(
  previous: BureaucracyCategory | null,
  next: BureaucracyCategory | null,
): CaseProfileContextCorrection | null {
  if (previous === next) return null;
  return {
    field: "category",
    summary: "Optional category updated; the previous clarification answer was cleared.",
  };
}
