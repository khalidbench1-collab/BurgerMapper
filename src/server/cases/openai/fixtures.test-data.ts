import type { ModelCaseOutput } from "@/server/cases/openai/schemas";

export function createSyntheticModelCaseOutput(): ModelCaseOutput {
  return {
    profileGoal: "Renew a fictional residence permit.",
    document: {
      title: "Synthetic document request",
      issuingAuthority: "Fictional Berlin authority",
      documentType: "Synthetic request",
      documentLanguage: "German",
      detectedDate: "2026-07-01",
      detectedDeadline: "2026-07-15",
    },
    interpretation: {
      summary: "A synthetic authority requests fictional supporting documents.",
      whatTheAuthorityWants: "Prepare the fictional documents before the deadline.",
      missingInformation: ["Employment status changes the evidence route."],
    },
    urgency: "high",
    requiredDocuments: [{ id: "passport", title: "Passport copy", description: "A synthetic passport-copy requirement.", status: "required" }],
    clarification: {
      needed: true,
      sufficiencyReason: "One route-changing answer is needed.",
      question: {
        id: "employment-status",
        prompt: "Are you employed, self-employed, or both?",
        reason: "The answer changes the evidence route.",
        options: [
          { id: "employed", label: "Employed", routeImpact: "Prepare employment evidence." },
          { id: "self-employed", label: "Self-employed", routeImpact: "Prepare business evidence." },
          { id: "dont-know", label: "I don't know", routeImpact: "Add a verification step." },
        ],
      },
    },
    nextSteps: [{ order: 1, title: "Prepare documents", description: "Collect the fictional items.", responsibleParty: "You", timing: "Before the deadline", status: "needs-answer" }],
    profileFacts: [{ id: "authority", label: "Issuing authority", value: "Fictional Berlin authority", source: "document" }],
    profileUncertainties: [{ id: "employment", description: "Employment status is not known." }],
    disclaimer: "This is general legal information, not legal advice. Verify changing requirements with official sources.",
    verification: { required: false, trigger: "none", reasons: [] },
  };
}
