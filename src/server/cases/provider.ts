import type { CaseAnalysis, CaseInput } from "@/domain/case";
import { CaseRequestError } from "@/server/cases/errors";
import type { NormalizedCaseInput } from "@/server/cases/types";
import { MockDocumentAnalysisService } from "@/services/document-analysis";

export interface AnalysisRuntimeConfiguration {
  mockEnabled: boolean;
  openAiApiKeyConfigured: boolean;
}

export function readAnalysisRuntimeConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): AnalysisRuntimeConfiguration {
  const configuredMockValue = environment.ENABLE_MOCK_AI?.trim().toLowerCase();
  const mockEnabled = configuredMockValue
    ? configuredMockValue === "true"
    : environment.NODE_ENV !== "production";

  return {
    mockEnabled,
    openAiApiKeyConfigured: Boolean(environment.OPENAI_API_KEY?.trim()),
  };
}

export async function runConfiguredAnalysis(
  input: NormalizedCaseInput,
  configuration: AnalysisRuntimeConfiguration,
  mockDelayMs?: number,
): Promise<CaseAnalysis> {
  if (!configuration.mockEnabled) {
    // Phase 2 deliberately has no real provider, even when a key exists.
    throw new CaseRequestError("API_NOT_CONFIGURED", 503);
  }

  try {
    const service = new MockDocumentAnalysisService(mockDelayMs);
    return await service.analyzeDocument(toMockCaseInput(input));
  } catch (error) {
    if (error instanceof CaseRequestError) throw error;
    throw new CaseRequestError("MOCK_PROVIDER_ERROR", 500);
  }
}

function toMockCaseInput(input: NormalizedCaseInput): CaseInput {
  const categoryPart = input.category ? { category: input.category } : {};
  const goalPart = input.normalizedGoal ? { goal: input.normalizedGoal } : {};

  if (input.kind === "goal") {
    return {
      kind: "goal",
      goal: input.normalizedGoal,
      outputLanguage: input.outputLanguage,
      ...categoryPart,
    };
  }

  if (input.kind === "text") {
    return {
      kind: "text",
      text: input.normalizedText,
      outputLanguage: input.outputLanguage,
      ...categoryPart,
      ...goalPart,
    };
  }
  if (input.kind === "sample") {
    return {
      kind: "sample",
      sampleId: input.sampleId,
      outputLanguage: input.outputLanguage,
      ...categoryPart,
      ...goalPart,
    };
  }
  return {
    kind: "file",
    outputLanguage: input.outputLanguage,
    ...categoryPart,
    ...goalPart,
    document: {
      id: `server-upload-${input.receivedAt}`,
      metadata: {
        name: input.file.metadata.filename,
        mimeType: input.file.metadata.detectedMimeType,
        sizeBytes: input.file.metadata.sizeBytes,
        selectedAt: input.receivedAt,
        source: "upload",
      },
    },
  };
}
