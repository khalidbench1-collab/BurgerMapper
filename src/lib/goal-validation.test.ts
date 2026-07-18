import { describe, expect, it } from "vitest";

import {
  MAX_GOAL_CHARACTERS,
  validateCaseGoal,
} from "@/lib/goal-validation";

describe("goal validation", () => {
  it("normalizes useful goal text", () => {
    expect(validateCaseGoal("  Renew   my permit.\r\nCheck documents. ")).toEqual({
      valid: true,
      normalizedGoal: "Renew my permit.\nCheck documents.",
    });
  });

  it("rejects a blank or too-short goal", () => {
    expect(validateCaseGoal("   too short ")).toMatchObject({
      valid: false,
      code: "GOAL_TOO_SHORT",
    });
  });

  it("rejects a goal over the maximum", () => {
    expect(validateCaseGoal("x".repeat(MAX_GOAL_CHARACTERS + 1))).toMatchObject({
      valid: false,
      code: "GOAL_TOO_LONG",
    });
  });
});
