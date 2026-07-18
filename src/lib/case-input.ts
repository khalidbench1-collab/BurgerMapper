import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseInput,
  SupportedLanguage,
  UploadedDocument,
} from "@/domain/case";
import { validatePastedText } from "@/lib/text-validation";
import { normalizeGoal, validateCaseGoal } from "@/lib/goal-validation";

type TextCaseInputResult =
  | { valid: true; input: Extract<CaseInput, { kind: "text" }> }
  | { valid: false; error: string };

function categoryPart(category: BureaucracyCategory | null) {
  return category ? { category } : {};
}

function goalPart(goal: string | null) {
  if (!goal) return {};
  return { goal: normalizeGoal(goal) };
}

type GoalCaseInputResult =
  | { valid: true; input: Extract<CaseInput, { kind: "goal" }> }
  | { valid: false; error: string };

export function createGoalCaseInput(
  goal: string,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
): GoalCaseInputResult {
  const validation = validateCaseGoal(goal);
  if (!validation.valid) return validation;

  return {
    valid: true,
    input: {
      kind: "goal",
      goal: validation.normalizedGoal,
      outputLanguage,
      ...categoryPart(category),
    },
  };
}

export function createTextCaseInput(
  text: string,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
  goal: string | null = null,
): TextCaseInputResult {
  const validation = validatePastedText(text);
  if (!validation.valid) return validation;

  return {
    valid: true,
    input: {
      kind: "text",
      text: validation.normalizedText,
      outputLanguage,
      ...categoryPart(category),
      ...goalPart(goal),
    },
  };
}

export function createFileCaseInput(
  document: UploadedDocument,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
  goal: string | null = null,
): Extract<CaseInput, { kind: "file" }> {
  return {
    kind: "file",
    document,
    outputLanguage,
    ...categoryPart(category),
    ...goalPart(goal),
  };
}

export function createSampleCaseInput(
  sampleId: string,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
  goal: string | null = null,
): Extract<CaseInput, { kind: "sample" }> {
  return {
    kind: "sample",
    sampleId,
    outputLanguage,
    ...categoryPart(category),
    ...goalPart(goal),
  };
}
