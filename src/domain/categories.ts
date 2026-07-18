export type BureaucracyCategory =
  | "arrival-registration"
  | "visa-immigration"
  | "work-business"
  | "housing-money"
  | "health-insurance"
  | "family-children";

export interface BureaucracyCategoryDefinition {
  id: BureaucracyCategory;
  label: string;
  description: string;
  examples: string[];
}

export const BUREAUCRACY_CATEGORIES: readonly BureaucracyCategoryDefinition[] = [
  {
    id: "arrival-registration",
    label: "Arrival & Registration",
    description: "First steps after arriving and registering your address.",
    examples: ["Anmeldung", "tax ID", "broadcasting contribution"],
  },
  {
    id: "visa-immigration",
    label: "Visa & Immigration",
    description: "Residence status, renewals, and family immigration routes.",
    examples: ["residence permits", "renewals", "family reunification"],
  },
  {
    id: "work-business",
    label: "Work & Business",
    description: "Employment, independent work, and business registration.",
    examples: ["employment", "freelancing", "Gewerbe", "tax registration"],
  },
  {
    id: "housing-money",
    label: "Housing & Money",
    description: "Housing documents, financial access, and support questions.",
    examples: ["rental documents", "SCHUFA", "Wohngeld", "banking"],
  },
  {
    id: "health-insurance",
    label: "Health & Insurance",
    description: "Coverage, certificates, and health-insurance paperwork.",
    examples: ["health insurance", "certificates", "coverage questions"],
  },
  {
    id: "family-children",
    label: "Family & Children",
    description: "Family benefits, childcare, and related processes.",
    examples: ["Kita", "Kindergeld", "Elterngeld", "family processes"],
  },
] as const;

export function isBureaucracyCategory(
  value: string | undefined,
): value is BureaucracyCategory {
  return BUREAUCRACY_CATEGORIES.some((category) => category.id === value);
}

export function getCategoryDefinition(
  categoryId: BureaucracyCategory,
): BureaucracyCategoryDefinition {
  const category = BUREAUCRACY_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) {
    throw new Error(`Unknown bureaucracy category: ${categoryId}`);
  }
  return category;
}
