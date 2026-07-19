import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("describes the goal-first product and independent identity", () => {
    const result = manifest();

    expect(result.name).toBe("BurgerMapper");
    expect(result.description).toMatch(/what you need to get done/i);
    expect(result.description).toMatch(/not a government service/i);
  });

  it("declares installability foundations without offline claims", () => {
    const result = manifest();

    expect(result.display).toBe("standalone");
    expect(result.icons).toHaveLength(1);
    expect(result.icons?.[0]?.src).toBe("/favicon.ico");
    expect(JSON.stringify(result)).not.toMatch(/offline/i);
  });
});
