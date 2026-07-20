import { CaseRequestError } from "@/server/cases/errors";
import { DEFAULT_OPENAI_MODEL } from "@/server/cases/openai/config";
import {
  OpenAICaseBuilderProvider,
  type OpenAIResponsesTransport,
  type ProviderCaseResult,
} from "@/server/cases/openai/provider";
import type { NormalizedCaseInput } from "@/server/cases/types";

export interface AnalysisRuntimeConfiguration {
  openAiApiKeyConfigured: boolean;
  openAiApiKey?: string;
  openAiModel?: string;
}

export function readAnalysisRuntimeConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): AnalysisRuntimeConfiguration {
  return {
    openAiApiKeyConfigured: Boolean(environment.OPENAI_API_KEY?.trim()),
    openAiApiKey: environment.OPENAI_API_KEY?.trim(),
    openAiModel: environment.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
  };
}

/**
 * BurgerMapper runs real OpenAI analysis only. There is deliberately no demo
 * fallback: a missing key fails loudly rather than silently serving an example
 * case that does not reflect the user's input.
 */
export async function runConfiguredAnalysis(
  input: NormalizedCaseInput,
  configuration: AnalysisRuntimeConfiguration,
  options: { transport?: OpenAIResponsesTransport; signal?: AbortSignal } = {},
): Promise<ProviderCaseResult> {
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
