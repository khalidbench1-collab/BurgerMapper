import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { LanguageSelector } from "@/components/case/language-selector";

it("reports a new output language selection", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<LanguageSelector value="en" onChange={onChange} />);

  await user.click(screen.getByRole("radio", { name: /German/i }));

  expect(onChange).toHaveBeenCalledWith("de");
});
