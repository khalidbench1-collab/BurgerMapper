import type {
  CaseInput,
  CaseAnalysis,
  ClarificationAnswerId,
  DocumentAnalysisService,
} from "@/domain/case";
import {
  adaptCategoryClarification,
  applyCategoryMockVariation,
} from "@/mocks/category-variations";
import {
  buildMockCaseAnalysis,
  getMockRouteVariant,
} from "@/mocks/case-analysis";

export const MOCK_ANALYSIS_DELAY_MS = 900;

export class MockDocumentAnalysisService implements DocumentAnalysisService {
  constructor(private readonly delayMs = MOCK_ANALYSIS_DELAY_MS) {}

  async analyzeDocument(input: CaseInput): Promise<CaseAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    return applyCategoryMockVariation(buildMockCaseAnalysis(input));
  }
}

const mockService = new MockDocumentAnalysisService();

export async function analyzeDocument(
  input: CaseInput,
): Promise<CaseAnalysis> {
  return mockService.analyzeDocument(input);
}

export function adaptAnalysisToClarification(
  analysis: CaseAnalysis,
  answer: ClarificationAnswerId,
): CaseAnalysis {
  const categoryAdaptation = adaptCategoryClarification(analysis, answer);
  if (categoryAdaptation) return categoryAdaptation;

  const variant = getMockRouteVariant(analysis.outputLanguage, answer);
  if (!variant) return analysis;

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
