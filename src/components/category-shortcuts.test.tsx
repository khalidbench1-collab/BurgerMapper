import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryShortcuts } from "@/components/category-shortcuts";
import { BUREAUCRACY_CATEGORIES } from "@/domain/categories";

describe("CategoryShortcuts", () => {
  it("renders all six product categories", () => {
    render(<CategoryShortcuts />);

    for (const category of BUREAUCRACY_CATEGORIES) {
      expect(
        screen.getByRole("link", { name: new RegExp(category.label, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("links Visa & Immigration to the preselected case workflow", () => {
    render(<CategoryShortcuts />);

    expect(
      screen.getByRole("link", { name: /Visa & Immigration/i }),
    ).toHaveAttribute("href", "/case?category=visa-immigration");
  });
});
