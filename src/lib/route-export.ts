import type { CaseAnalysis } from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";
import { formatCaseDate } from "@/lib/date-format";

/**
 * The export file name is a fixed constant so no goal, document name, or
 * other personal data can leak into the downloaded file's name.
 */
export const ROUTE_EXPORT_FILE_NAME = "burgermapper-route.txt";

/**
 * Builds a plain-text version of the already rendered structured route.
 * The export is assembled entirely in the browser from the analysis the
 * user is viewing; nothing is uploaded, persisted, or re-requested.
 */
export function buildRouteExportText(analysis: CaseAnalysis): string {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const sourceIndex = new Map(analysis.officialSources.map((source, index) => [source.id, index + 1]));
  const lines: string[] = [];

  lines.push("BurgerMapper");
  lines.push(analysis.documentTitle);
  lines.push(analysis.isMock ? copy.mockBadge : "OpenAI analysis");
  lines.push("");

  lines.push(`${copy.deadlineAndUrgency}`);
  lines.push(`${copy.deadline}: ${formatCaseDate(analysis.detectedDeadline, analysis.outputLanguage)}`);
  lines.push(`${copy.urgency}: ${copy.urgencyLevel[analysis.urgency]}`);
  lines.push("");

  const firstStep = analysis.nextSteps[0];
  if (firstStep) {
    lines.push(copy.firstAction);
    lines.push(`1. ${firstStep.title}`);
    lines.push(firstStep.description);
    lines.push(`${copy.responsible}: ${firstStep.responsibleParty} — ${copy.timing}: ${firstStep.timing}`);
    lines.push("");
  }

  lines.push(copy.authorityWants);
  lines.push(analysis.whatTheAuthorityWants);
  lines.push("");

  lines.push(copy.summary);
  lines.push(analysis.summary);
  lines.push("");

  if (analysis.requiredDocuments.length) {
    lines.push(copy.documents);
    for (const document of analysis.requiredDocuments) {
      lines.push(`- ${document.title} (${document.status === "required" ? copy.required : copy.dependsOnAnswer})`);
      lines.push(`  ${document.description}`);
    }
    lines.push("");
  }

  lines.push(copy.nextSteps);
  for (const step of analysis.nextSteps) {
    const references = (step.claimIds ?? [])
      .flatMap((claimId) => analysis.routeClaims?.find((claim) => claim.id === claimId)?.sourceIds ?? [])
      .map((sourceId) => sourceIndex.get(sourceId))
      .filter((position): position is number => position !== undefined);
    const referenceSuffix = references.length ? ` [${[...new Set(references)].join(", ")}]` : "";
    lines.push(`${step.order}. ${step.title}${referenceSuffix}`);
    lines.push(`   ${step.description}`);
    lines.push(`   ${copy.responsible}: ${step.responsibleParty} — ${copy.timing}: ${step.timing}`);
  }
  lines.push("");

  if (analysis.missingInformation.length) {
    lines.push(copy.clarification);
    for (const item of analysis.missingInformation) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (analysis.officialSources.length) {
    lines.push(copy.sources);
    for (const source of analysis.officialSources) {
      lines.push(`[${sourceIndex.get(source.id)}] ${source.publisher} — ${source.title}`);
      lines.push(`    ${source.url}`);
    }
    lines.push("");
  }

  lines.push(copy.limitation);
  lines.push(analysis.disclaimer);

  return lines.join("\n");
}
