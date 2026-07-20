import { getCategoryDefinition } from "@/domain/categories";
import type { SupportedLanguage } from "@/domain/case";
import { MAX_CLARIFICATION_QUESTIONS } from "@/server/cases/openai/config";
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

/**
 * Without an explicit budget the model either loops on questions or finalizes
 * early and dumps route-changing unknowns into the route. Give it the count.
 */
function questionBudgetInstruction(input: NormalizedCaseInput): string {
  const answered = input.clarificationResolution
    ? (input.clarificationResolution.answerHistory?.length ?? 0) + 1
    : 0;
  const remaining = Math.max(0, MAX_CLARIFICATION_QUESTIONS - answered);
  if (remaining === 0) {
    return `Question budget: you have asked ${answered} of ${MAX_CLARIFICATION_QUESTIONS} allowed questions. You must finalize the route now with clarification.needed = false and ask nothing further.`;
  }
  return `Question budget: you have asked ${answered} of ${MAX_CLARIFICATION_QUESTIONS} allowed questions, so you may ask up to ${remaining} more (one per response). While budget remains, spend it: if any unknown would change the route, ask about the most decisive one instead of finalizing.`;
}

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
    questionBudgetInstruction(input),
    input.clarificationResolution
      ? [
          (input.clarificationResolution.answerHistory ?? []).length > 0
            ? `Questions already answered earlier in this case — never ask any of these again, and treat every answer as established fact:\n${(input.clarificationResolution.answerHistory ?? [])
                .map((entry, index) => `${index + 1}. ${entry.questionPrompt}\n   Answer: ${entry.answerLabel}`)
                .join("\n")}`
            : null,
          `A previous route-changing question was answered. Question: ${input.clarificationResolution.questionPrompt}\nWhy it matters: ${input.clarificationResolution.questionReason}\nAnswer: ${input.clarificationResolution.answerLabel} (id: ${input.clarificationResolution.answerId}). Update the profile and route; ask another question only if it is still consequential and not already answered above. A user answer may state several facts at once — extract all of them before deciding whether anything is still missing.`,
        ].filter(Boolean).join("\n\n")
      : "No clarification answer has been supplied yet.",
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
