import type { BureaucracyCategory } from "@/domain/categories";
import type {
  CaseInput,
  SupportedLanguage,
  UploadedDocument,
} from "@/domain/case";
import { validatePastedText } from "@/lib/text-validation";

type TextCaseInputResult =
  | { valid: true; input: Extract<CaseInput, { kind: "text" }> }
  | { valid: false; error: string };

function categoryPart(category: BureaucracyCategory | null) {
  return category ? { category } : {};
}

export function createTextCaseInput(
  text: string,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
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
    },
  };
}

export function createFileCaseInput(
  document: UploadedDocument,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
): Extract<CaseInput, { kind: "file" }> {
  return {
    kind: "file",
    document,
    outputLanguage,
    ...categoryPart(category),
  };
}

export function createSampleCaseInput(
  sampleId: string,
  outputLanguage: SupportedLanguage,
  category: BureaucracyCategory | null,
): Extract<CaseInput, { kind: "sample" }> {
  return {
    kind: "sample",
    sampleId,
    outputLanguage,
    ...categoryPart(category),
  };
}
