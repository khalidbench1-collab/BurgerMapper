export const MIN_GOAL_MEANINGFUL_CHARACTERS = 10;
export const MAX_GOAL_CHARACTERS = 1_000;

export type GoalValidationResult =
  | { valid: true; normalizedGoal: string }
  | { valid: false; code: "GOAL_TOO_SHORT" | "GOAL_TOO_LONG"; error: string };

export function normalizeGoal(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/[\t ]+/g, " ").trim();
}

export function validateCaseGoal(value: string): GoalValidationResult {
  if (value.length > MAX_GOAL_CHARACTERS) {
    return {
      valid: false,
      code: "GOAL_TOO_LONG",
      error: `Keep your goal to ${MAX_GOAL_CHARACTERS.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  const normalizedGoal = normalizeGoal(value);
  const meaningfulCharacters = normalizedGoal.replace(/\s/g, "").length;
  if (meaningfulCharacters < MIN_GOAL_MEANINGFUL_CHARACTERS) {
    return {
      valid: false,
      code: "GOAL_TOO_SHORT",
      error: `Add at least ${MIN_GOAL_MEANINGFUL_CHARACTERS} non-whitespace characters so the goal is useful.`,
    };
  }

  return { valid: true, normalizedGoal };
}
