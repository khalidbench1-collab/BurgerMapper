import { zodTextFormat } from "openai/helpers/zod";

import type { NormalizedCaseInput } from "@/server/cases/types";
import { planFutureResponsesRequest } from "@/server/cases/request-plan";
import { OPENAI_MAX_OUTPUT_TOKENS, REASONING_BY_TASK, type VerifiedReasoningEffort } from "@/server/cases/openai/config";
import { OPENAI_CASE_BUILDER_INSTRUCTION, OPENAI_VERIFICATION_INSTRUCTION } from "@/server/cases/openai/prompts";
import { ModelCaseOutputSchema, ModelVerificationOutputSchema, type ModelCaseOutput } from "@/server/cases/openai/schemas";

export interface PlannedOpenAIRequest {
  model: string;
  input: Array<{ role: "system" | "user"; content: string | Array<Record<string, unknown>> }>;
  text: { format: ReturnType<typeof zodTextFormat> };
  reasoning: { effort: VerifiedReasoningEffort };
  max_output_tokens: number;
  store: false;
}

export function buildInitialOpenAIRequest(input: NormalizedCaseInput, model: string): PlannedOpenAIRequest {
  const plan = planFutureResponsesRequest(input, { detail: "low" });
  const content: Array<Record<string, unknown>> = [
    { type: "input_text", text: plan.context.text },
  ];
  if (plan.goalInput) content.push({ type: "input_text", text: plan.goalInput.text });
  if (plan.documentInput.type === "input_text") {
    content.push({ type: "input_text", text: plan.documentInput.text });
  } else if (plan.documentInput.type === "input_file") {
    content.push({ type: "input_file", filename: plan.documentInput.filename, file_data: plan.documentInput.fileData, detail: plan.documentInput.detail });
  } else {
    content.push({ type: "input_image", image_url: plan.documentInput.imageDataUrl, detail: plan.documentInput.detail });
  }

  return {
    model,
    input: [
      { role: "system", content: OPENAI_CASE_BUILDER_INSTRUCTION },
      { role: "user", content },
    ],
    text: { format: zodTextFormat(ModelCaseOutputSchema, "burger_mapper_case") },
    reasoning: { effort: input.kind === "goal" ? REASONING_BY_TASK.intake : REASONING_BY_TASK.document },
    max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
    store: false,
  };
}

export function buildVerificationOpenAIRequest(output: unknown, model: string, trigger?: ModelCaseOutput["verification"]["trigger"]): PlannedOpenAIRequest {
  const resolvedTrigger = trigger ?? (ModelCaseOutputSchema.safeParse(output).success ? (output as ModelCaseOutput).verification.trigger : "failed-validation");
  return {
    model,
    input: [
      { role: "system", content: OPENAI_VERIFICATION_INSTRUCTION },
      { role: "user", content: JSON.stringify({ trigger: resolvedTrigger, result: output }) },
    ],
    text: { format: zodTextFormat(ModelVerificationOutputSchema, "burger_mapper_verification") },
    reasoning: { effort: REASONING_BY_TASK[resolvedTrigger === "high-risk" ? "high-risk" : "route"] },
    max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
    store: false,
  };
}
