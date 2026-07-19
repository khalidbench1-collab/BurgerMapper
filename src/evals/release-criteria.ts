import type { EvaluationResult } from "@/evals/contracts";
import { RELEASE_COST_LIMITS } from "@/server/operations/cost";

export interface ReleaseGateSummary {
  passed: boolean;
  casePassRate: number;
  structuredOutputValidityRate: number;
  questionQualityRate: number;
  routeCompletenessRate: number;
  citationValidityRate: number;
  totalEstimatedCostUsd: number;
  blockers: string[];
}

export function assessRelease(results: EvaluationResult[]): ReleaseGateSummary {
  const rate = (checkName: string) => results.length === 0 ? 0 : results.filter((result) => result.checks.find((check) => check.name === checkName)?.passed).length / results.length;
  const totalEstimatedCostUsd = Number(results.reduce((sum, result) => sum + result.estimatedCostUsd, 0).toFixed(6));
  const blockers = results.flatMap((result) => result.checks
    .filter((check) => check.releaseBlocking && !check.passed)
    .map((check) => `${result.caseId}:${check.name}`));
  if (totalEstimatedCostUsd > RELEASE_COST_LIMITS.estimatedUsdPerSyntheticSuite) blockers.push("suite:cost-budget");
  const rates = {
    casePassRate: results.length === 0 ? 0 : results.filter((result) => result.passed).length / results.length,
    structuredOutputValidityRate: rate("structured-output-valid"),
    questionQualityRate: rate("one-consequential-question"),
    routeCompletenessRate: rate("route-complete"),
    citationValidityRate: rate("citations-supported"),
  };
  return {
    ...rates,
    totalEstimatedCostUsd,
    blockers,
    passed: results.length > 0 && blockers.length === 0 && Object.values(rates).every((value) => value === 1),
  };
}
