import type {
  AnalysisInput,
  CaseAnalysis,
  ClarificationAnswerId,
  DocumentAnalysisService,
} from "@/domain/case";
import {
  buildMockCaseAnalysis,
  getMockRouteVariant,
} from "@/mocks/case-analysis";

export const MOCK_ANALYSIS_DELAY_MS = 900;

export class MockDocumentAnalysisService implements DocumentAnalysisService {
  constructor(private readonly delayMs = MOCK_ANALYSIS_DELAY_MS) {}

  async analyzeDocument(input: AnalysisInput): Promise<CaseAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    return buildMockCaseAnalysis(input.outputLanguage);
  }
}

const mockService = new MockDocumentAnalysisService();

export async function analyzeDocument(
  input: AnalysisInput,
): Promise<CaseAnalysis> {
  return mockService.analyzeDocument(input);
}

export function adaptAnalysisToClarification(
  analysis: CaseAnalysis,
  answer: ClarificationAnswerId,
): CaseAnalysis {
  const variant = getMockRouteVariant(analysis.outputLanguage, answer);

  return {
    ...analysis,
    requiredDocuments: analysis.requiredDocuments.map((document) =>
      document.id === "income-evidence"
        ? { ...variant.incomeDocument }
        : { ...document },
    ),
    missingInformation: [variant.remainingUncertainty],
    clarificationQuestion: {
      ...analysis.clarificationQuestion,
      selectedAnswerId: answer,
    },
    nextSteps: analysis.nextSteps.map((step) =>
      step.order === 2
        ? {
            ...step,
            ...variant.incomeStep,
          }
        : { ...step, officialSourceIds: [...step.officialSourceIds] },
    ),
  };
}
