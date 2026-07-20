import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "@/app/page";
import { BUREAUCRACY_CATEGORIES } from "@/domain/categories";

const originalMockFlag = process.env.ENABLE_MOCK_AI;

afterEach(() => {
  if (originalMockFlag === undefined) {
    delete process.env.ENABLE_MOCK_AI;
  } else {
    process.env.ENABLE_MOCK_AI = originalMockFlag;
  }
});

describe("Home", () => {
  it("leads with the goal-first value proposition and primary action", () => {
    process.env.ENABLE_MOCK_AI = "true";
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: /start with what you need to get done/i }),
    ).toBeInTheDocument();

    const primaryAction = screen.getByRole("link", { name: /describe your goal/i });
    expect(primaryAction).toHaveAttribute("href", "/case");

    const categoriesHeading = screen.getByRole("heading", { name: /choose an area/i });
    expect(
      primaryAction.compareDocumentPosition(categoriesHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps all six categories as secondary shortcuts plus a general entry", () => {
    process.env.ENABLE_MOCK_AI = "true";
    render(<Home />);

    for (const category of BUREAUCRACY_CATEGORIES) {
      expect(screen.getByRole("link", { name: new RegExp(category.label, "i") })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /start a general case/i })).toHaveAttribute("href", "/case");
  });

  it("shows the non-government identity and a skip link", () => {
    process.env.ENABLE_MOCK_AI = "true";
    render(<Home />);

    expect(
      screen.getByText(/independent guide, not an official government service/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("always describes the real analysis route with no demo variant", () => {
    process.env.ENABLE_MOCK_AI = "true";
    render(<Home />);

    expect(screen.getAllByText(/official-source citations/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/demo route/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo mode/i)).not.toBeInTheDocument();
  });

  it("keeps the hero free of the privacy paragraph and shows the Beta badge", () => {
    process.env.ENABLE_MOCK_AI = "false";
    render(<Home />);

    expect(screen.queryByText(/sent to OpenAI for analysis only after you explicitly agree/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/never sent to an AI provider/i)).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});
