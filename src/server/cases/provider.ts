import type { CaseInput } from "@/domain/case";
import { CaseRequestError } from "@/server/cases/errors";
import { DEFAULT_OPENAI_MODEL } from "@/server/cases/openai/config";
import {
  OpenAICaseBuilderProvider,
  type OpenAIResponsesTransport,
  type ProviderCaseResult,
} from "@/server/cases/openai/provider";
import type { NormalizedCaseInput } from "@/server/cases/types";
import { MockDocumentAnalysisService } from "@/services/document-analysis";

export interface AnalysisRuntimeConfiguration {
  mockEnabled: boolean;
  openAiApiKeyConfigured: boolean;
  openAiApiKey?: string;
  openAiModel?: string;
}

export function readAnalysisRuntimeConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): AnalysisRuntimeConfiguration {
  const configuredMockValue = environment.ENABLE_MOCK_AI?.trim().toLowerCase();
  const mockEnabled = configuredMockValue === undefined
    ? environment.NODE_ENV !== "production"
    : configuredMockValue !== "false";

  return {
    mockEnabled,
    openAiApiKeyConfigured: Boolean(environment.OPENAI_API_KEY?.trim()),
    openAiApiKey: environment.OPENAI_API_KEY?.trim(),
    openAiModel: environment.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
  };
}

export async function runConfiguredAnalysis(
  input: NormalizedCaseInput,
  configuration: AnalysisRuntimeConfiguration,
  mockDelayMs?: number,
  options: { transport?: OpenAIResponsesTransport; signal?: AbortSignal } = {},
): Promise<ProviderCaseResult> {
  if (!configuration.mockEnabled) {
    if (!configuration.openAiApiKeyConfigured || !configuration.openAiApiKey?.trim()) {
      throw new CaseRequestError("API_NOT_CONFIGURED", 503);
    }
    const provider = new OpenAICaseBuilderProvider({
      apiKey: configuration.openAiApiKey,
      model: configuration.openAiModel?.trim() || DEFAULT_OPENAI_MODEL,
      transport: options.transport,
    });
    return provider.analyze(input, options.signal);
  }

  try {
    const service = new MockDocumentAnalysisService(mockDelayMs);
    return {
      analysis: await service.analyzeDocument(toMockCaseInput(input)),
      processingMode: "mock",
    };
  } catch (error) {
    if (error instanceof CaseRequestError) throw error;
    throw new CaseRequestError("MOCK_PROVIDER_ERROR", 500);
  }
}

function toMockCaseInput(input: NormalizedCaseInput): CaseInput {
  const categoryPart = input.category ? { category: input.category } : {};
  const goalPart = input.normalizedGoal ? { goal: input.normalizedGoal } : {};
  const resolutionPart = input.clarificationResolution
    ? { clarificationResolution: input.clarificationResolution }
    : {};

  if (input.kind === "goal") {
    return {
      kind: "goal",
      goal: input.normalizedGoal,
      outputLanguage: input.outputLanguage,
      ...categoryPart,
      ...resolutionPart,
    };
  }

  if (input.kind === "text") {
    return {
      kind: "text",
      text: input.normalizedText,
      outputLanguage: input.outputLanguage,
      ...categoryPart,
      ...goalPart,
      ...resolutionPart,
    };
  }
  if (input.kind === "sample") {
    return {
      kind: "sample",
      sampleId: input.sampleId,
      outputLanguage: input.outputLanguage,
      ...categoryPart,
      ...goalPart,
      ...resolutionPart,
    };
  }
  return {
    kind: "file",
    outputLanguage: input.outputLanguage,
    ...categoryPart,
    ...goalPart,
    ...resolutionPart,
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
