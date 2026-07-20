import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LanguageMenu } from "@/components/case/language-menu";

describe("LanguageMenu", () => {
  it("keeps the options closed until the trigger is used", () => {
    render(<LanguageMenu value="en" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Output language: English/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("reports a new output language selection and closes the menu", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LanguageMenu value="en" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Output language/i }));
    await user.click(screen.getByRole("menuitemradio", { name: /German/i }));

    expect(onChange).toHaveBeenCalledWith("de");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("marks the active language for assistive technology", async () => {
    const user = userEvent.setup();
    render(<LanguageMenu value="ar" onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Output language/i }));

    expect(screen.getByRole("menuitemradio", { name: /Arabic/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: /English/i })).toHaveAttribute("aria-checked", "false");
  });

  it("closes on Escape without changing the language", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LanguageMenu value="en" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Output language/i }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
