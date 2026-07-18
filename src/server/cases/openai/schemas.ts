import { z } from "zod";

const boundedText = z.string().min(1).max(4_000);
const shortText = z.string().min(1).max(300);

export const ModelCaseOutputSchema = z.object({
  profileGoal: boundedText,
  document: z.object({
    title: shortText,
    issuingAuthority: shortText,
    documentType: shortText,
    documentLanguage: shortText,
    detectedDate: z.string().max(10),
    detectedDeadline: z.string().max(10),
  }),
  interpretation: z.object({
    summary: boundedText,
    whatTheAuthorityWants: boundedText,
    missingInformation: z.array(boundedText).max(12),
  }),
  urgency: z.enum(["low", "medium", "high"]),
  requiredDocuments: z.array(z.object({
    id: shortText,
    title: shortText,
    description: boundedText,
    status: z.enum(["required", "depends-on-answer"]),
  })).max(20),
  clarification: z.object({
    needed: z.boolean(),
    sufficiencyReason: boundedText,
    question: z.object({
      id: shortText,
      prompt: boundedText,
      reason: boundedText,
      options: z.array(z.object({
        id: shortText,
        label: shortText,
        routeImpact: boundedText,
      })).min(2).max(5),
    }).nullable(),
  }),
  nextSteps: z.array(z.object({
    order: z.number().int().min(1).max(20),
    title: shortText,
    description: boundedText,
    responsibleParty: shortText,
    timing: shortText,
    status: z.enum(["ready", "needs-answer", "not-started"]),
  })).min(1).max(20),
  profileFacts: z.array(z.object({
    id: shortText,
    label: shortText,
    value: boundedText,
    source: z.enum(["document", "model-interpretation"]),
  })).max(30),
  profileUncertainties: z.array(z.object({
    id: shortText,
    description: boundedText,
  })).max(20),
  disclaimer: boundedText,
  verification: z.object({
    required: z.boolean(),
    trigger: z.enum(["none", "high-risk", "source-conflict", "unsupported-claim", "failed-validation"]),
    reasons: z.array(boundedText).max(8),
  }),
});

export const ModelVerificationOutputSchema = z.object({
  valid: z.boolean(),
  issues: z.array(boundedText).max(12),
  correctedOutput: ModelCaseOutputSchema,
});

export type ModelCaseOutput = z.infer<typeof ModelCaseOutputSchema>;
export type ModelVerificationOutput = z.infer<typeof ModelVerificationOutputSchema>;
