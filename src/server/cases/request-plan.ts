import { getCategoryDefinition } from "@/domain/categories";
import type { SupportedLanguage } from "@/domain/case";
import { UNTRUSTED_DOCUMENT_SECURITY_INSTRUCTION } from "@/server/cases/security-instructions";
import { getTrustedSampleText } from "@/server/cases/trusted-samples";
import type { NormalizedCaseInput } from "@/server/cases/types";

export type PlannedInputDetail = "low" | "auto";

export type PlannedDocumentInput =
  | {
      type: "input_text";
      text: string;
      source: "case-goal" | "pasted-text" | "trusted-sample";
    }
  | {
      type: "input_file";
      filename: string;
      fileData: string;
      detail: PlannedInputDetail;
    }
  | {
      type: "input_image";
      imageDataUrl: string;
      detail: PlannedInputDetail;
    };

export interface FutureResponsesRequestPlan {
  context: {
    type: "input_text";
    text: string;
  };
  goalInput?: Extract<PlannedDocumentInput, { type: "input_text" }>;
  documentInput: PlannedDocumentInput;
}

export interface RequestPlanOptions {
  detail?: PlannedInputDetail;
}

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  de: "German",
  ar: "Arabic",
};

export function planFutureResponsesRequest(
  input: NormalizedCaseInput,
  options: RequestPlanOptions = {},
): FutureResponsesRequestPlan {
  const detail = options.detail ?? "low";
  const category = input.category
    ? getCategoryDefinition(input.category).label
    : "Not selected; do not infer eligibility from a category";

  const contextText = [
    "BurgerMapper case context",
    `Selected bureaucracy category: ${category}`,
    `Requested output language: ${LANGUAGE_NAMES[input.outputLanguage]}`,
    UNTRUSTED_DOCUMENT_SECURITY_INSTRUCTION,
  ].join("\n\n");

  const goalInput =
    input.kind !== "goal" && input.normalizedGoal
      ? {
          type: "input_text" as const,
          text: input.normalizedGoal,
          source: "case-goal" as const,
        }
      : undefined;

  return {
    context: { type: "input_text", text: contextText },
    ...(goalInput ? { goalInput } : {}),
    documentInput: planDocumentInput(input, detail),
  };
}

function planDocumentInput(
  input: NormalizedCaseInput,
  detail: PlannedInputDetail,
): PlannedDocumentInput {
  if (input.kind === "goal") {
    return {
      type: "input_text",
      text: input.normalizedGoal,
      source: "case-goal",
    };
  }
  if (input.kind === "text") {
    return {
      type: "input_text",
      text: input.normalizedText,
      source: "pasted-text",
    };
  }

  if (input.kind === "sample") {
    return {
      type: "input_text",
      text: getTrustedSampleText(input.sampleId),
      source: "trusted-sample",
    };
  }

  const base64 = Buffer.from(input.file.bytes).toString("base64");
  const mimeType = input.file.metadata.detectedMimeType;
  const dataUrl = `data:${mimeType};base64,${base64}`;

  if (mimeType === "application/pdf") {
    return {
      type: "input_file",
      filename: input.file.metadata.filename,
      fileData: dataUrl,
      detail,
    };
  }

  return {
    type: "input_image",
    imageDataUrl: dataUrl,
    detail,
  };
}
