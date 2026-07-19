export const LUNA_PRICE_USD_PER_MILLION = {
  input: 1,
  cachedInput: 0.1,
  output: 6,
} as const;

export function estimateLunaCostUsd(inputTokens: number, outputTokens: number, cachedInputTokens = 0): number {
  const uncachedInput = Math.max(0, inputTokens - cachedInputTokens);
  return Number((
    (uncachedInput * LUNA_PRICE_USD_PER_MILLION.input
      + Math.max(0, cachedInputTokens) * LUNA_PRICE_USD_PER_MILLION.cachedInput
      + Math.max(0, outputTokens) * LUNA_PRICE_USD_PER_MILLION.output) / 1_000_000
  ).toFixed(6));
}

export const RELEASE_COST_LIMITS = {
  estimatedUsdPerCase: 0.1,
  estimatedUsdPerSyntheticSuite: 1,
} as const;
