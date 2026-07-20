import { CASE_FORM_FIELDS } from "@/domain/analysis-api";
import { isBureaucracyCategory } from "@/domain/categories";
import type { ClarificationAnswerSummary, InputKind, SupportedLanguage } from "@/domain/case";
import { isKnownSampleId } from "@/domain/samples";
import {
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_FILE_TYPES,
} from "@/lib/file-validation";
import {
  MAX_PASTED_TEXT_CHARACTERS,
  validatePastedText,
} from "@/lib/text-validation";
import {
  MAX_GOAL_CHARACTERS,
  validateCaseGoal,
} from "@/lib/goal-validation";
import { MAX_CLARIFICATION_QUESTIONS } from "@/server/cases/openai/config";
import { CaseRequestError } from "@/server/cases/errors";
import type {
  NormalizedCaseInput,
  SupportedFileMimeType,
} from "@/server/cases/types";

const SUPPORTED_INPUT_KINDS: readonly InputKind[] = [
  "goal",
  "text",
  "file",
  "sample",
];
const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ["en", "de", "ar"];

export async function normalizeAnalyzeCaseFormData(
  formData: FormData,
  receivedAt: string,
): Promise<NormalizedCaseInput> {
  const kindValue = getSingleString(formData, CASE_FORM_FIELDS.kind, true);
  if (!kindValue) throw new CaseRequestError("INVALID_REQUEST", 400);
  if (!SUPPORTED_INPUT_KINDS.includes(kindValue as InputKind)) {
    throw new CaseRequestError("UNSUPPORTED_INPUT_KIND", 400);
  }

  const languageValue = getSingleString(
    formData,
    CASE_FORM_FIELDS.outputLanguage,
    true,
  );
  if (!languageValue || !SUPPORTED_LANGUAGES.includes(languageValue as SupportedLanguage)) {
    throw new CaseRequestError("INVALID_LANGUAGE", 400);
  }
  const outputLanguage = languageValue as SupportedLanguage;
  const clarificationResolution = parseClarificationResolution(
    getSingleString(formData, CASE_FORM_FIELDS.clarificationResolution, false),
  );

  const categoryValue = getSingleString(
    formData,
    CASE_FORM_FIELDS.category,
    false,
  );
  if (categoryValue && !isBureaucracyCategory(categoryValue)) {
    throw new CaseRequestError("INVALID_CATEGORY", 400);
  }
  const category = categoryValue && isBureaucracyCategory(categoryValue)
    ? categoryValue
    : null;

  const goalValue = getSingleString(formData, CASE_FORM_FIELDS.goal, false);
  if (goalValue && goalValue.length > MAX_GOAL_CHARACTERS) {
    throw new CaseRequestError("GOAL_TOO_LONG", 413);
  }
  let normalizedGoal: string | null = null;
  if (goalValue) {
    const validation = validateCaseGoal(goalValue);
    if (!validation.valid) {
      throw new CaseRequestError(validation.code, 422);
    }
    normalizedGoal = validation.normalizedGoal;
  }

  if (kindValue === "goal") {
    if (!normalizedGoal) throw new CaseRequestError("GOAL_REQUIRED", 422);
    return {
      kind: "goal",
      category,
      outputLanguage,
      receivedAt,
      normalizedGoal,
      clarificationResolution,
    };
  }

  if (kindValue === "text") {
    const text = getSingleString(formData, CASE_FORM_FIELDS.text, true);
    if (text === null) throw new CaseRequestError("INVALID_REQUEST", 400);
    if (text.length > MAX_PASTED_TEXT_CHARACTERS) {
      throw new CaseRequestError("TEXT_TOO_LONG", 413);
    }
    const validation = validatePastedText(text);
    if (!validation.valid) {
      throw new CaseRequestError("TEXT_TOO_SHORT", 422);
    }
    return {
      kind: "text",
      category,
      outputLanguage,
      normalizedGoal,
      normalizedText: validation.normalizedText,
      clarificationResolution,
      receivedAt,
    };
  }

  if (kindValue === "sample") {
    const sampleId = getSingleString(
      formData,
      CASE_FORM_FIELDS.sampleId,
      true,
    );
    if (!sampleId || !isKnownSampleId(sampleId)) {
      throw new CaseRequestError("UNKNOWN_SAMPLE", 422);
    }
    return {
      kind: "sample",
      category,
      outputLanguage,
      normalizedGoal,
      sampleId,
      clarificationResolution,
      receivedAt,
    };
  }

  const fileEntries = formData.getAll(CASE_FORM_FIELDS.file);
  if (fileEntries.length !== 1 || !(fileEntries[0] instanceof File)) {
    throw new CaseRequestError("FILE_REQUIRED", 400);
  }
  const file = fileEntries[0];
  if (file.size === 0) throw new CaseRequestError("FILE_EMPTY", 422);
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new CaseRequestError("FILE_TOO_LARGE", 413);
  }
  if (!ACCEPTED_FILE_TYPES.includes(file.type as SupportedFileMimeType)) {
    throw new CaseRequestError("UNSUPPORTED_FILE_TYPE", 415);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detectedMimeType = detectFileMimeType(bytes);
  if (!detectedMimeType || detectedMimeType !== file.type) {
    throw new CaseRequestError("FILE_SIGNATURE_MISMATCH", 422);
  }

  return {
    kind: "file",
    category,
    outputLanguage,
    normalizedGoal,
    clarificationResolution,
    receivedAt,
    file: {
      metadata: {
        filename: sanitizeFilename(file.name),
        claimedMimeType: file.type,
        detectedMimeType,
        sizeBytes: file.size,
      },
      bytes,
    },
  };
}

function parseClarificationResolution(value: string | null) {
  if (!value) return null;
  if (value.length > 6_000) throw new CaseRequestError("INVALID_REQUEST", 400);
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") throw new Error("invalid");
    const candidate = parsed as Record<string, unknown>;
    const fields = ["questionId", "questionPrompt", "questionReason", "answerId", "answerLabel"] as const;
    if (fields.some((field) => typeof candidate[field] !== "string" || !(candidate[field] as string).trim())) throw new Error("invalid");
    if (fields.some((field) => (candidate[field] as string).length > 500)) throw new Error("invalid");
    if (!Array.isArray(candidate.options) || candidate.options.length < 2 || candidate.options.length > 5) throw new Error("invalid");
    const options = candidate.options.map((option) => {
      if (!option || typeof option !== "object") throw new Error("invalid");
      const item = option as Record<string, unknown>;
      if (typeof item.id !== "string" || typeof item.label !== "string" || typeof item.routeImpact !== "string") throw new Error("invalid");
      if (!item.id.trim() || !item.label.trim() || !item.routeImpact.trim() || item.id.length > 300 || item.label.length > 300 || item.routeImpact.length > 500) throw new Error("invalid");
      return { id: item.id.trim(), label: item.label.trim(), routeImpact: item.routeImpact.trim() };
    });
    if (new Set(options.map((option) => option.id)).size !== options.length) throw new Error("invalid");
    const answerHistory = parseAnswerHistory(candidate.answerHistory);
    return {
      answerHistory,
      questionId: (candidate.questionId as string).trim(),
      questionPrompt: (candidate.questionPrompt as string).trim(),
      questionReason: (candidate.questionReason as string).trim(),
      answerId: (candidate.answerId as string).trim(),
      answerLabel: (candidate.answerLabel as string).trim(),
      options,
    };
  } catch {
    throw new CaseRequestError("INVALID_REQUEST", 400);
  }
}

function parseAnswerHistory(value: unknown): ClarificationAnswerSummary[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_CLARIFICATION_QUESTIONS) throw new Error("invalid");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("invalid");
    const item = entry as Record<string, unknown>;
    const fields = ["questionId", "questionPrompt", "answerLabel"] as const;
    if (fields.some((field) => typeof item[field] !== "string" || !(item[field] as string).trim())) throw new Error("invalid");
    if (fields.some((field) => (item[field] as string).length > 500)) throw new Error("invalid");
    return {
      questionId: (item.questionId as string).trim(),
      questionPrompt: (item.questionPrompt as string).trim(),
      answerLabel: (item.answerLabel as string).trim(),
    };
  });
}

function getSingleString(
  formData: FormData,
  field: string,
  required: boolean,
): string | null {
  const values = formData.getAll(field);
  if (values.length === 0) return required ? null : null;
  if (values.length !== 1 || typeof values[0] !== "string") {
    throw new CaseRequestError("INVALID_REQUEST", 400);
  }
  const value = values[0].trim();
  return value.length > 0 ? value : required ? null : null;
}

export function detectFileMimeType(
  bytes: Uint8Array,
): SupportedFileMimeType | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return "application/pdf";
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return (
    bytes.length >= signature.length &&
    signature.every((byte, index) => bytes[index] === byte)
  );
}

export function sanitizeFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).at(-1) ?? "document";
  const sanitized = basename
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return sanitized || "document";
}
