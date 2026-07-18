import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CaseWorkspace } from "@/components/case/case-workspace";

async function selectSampleAndWaitUntilReady(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Use the fictional sample letter" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Run mock analysis" })).toBeEnabled(),
  );
}

describe("CaseWorkspace", () => {
  it("renders the key sections after a mock analysis", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await selectSampleAndWaitUntilReady(user);

    await user.click(screen.getByRole("button", { name: "Run mock analysis" }));

    expect(await screen.findByTestId("analysis-result", {}, { timeout: 3_000 })).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("heading", { name: "What this letter says" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deadline and urgency" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What the authority wants" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Documents to prepare" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your next steps" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Official sources" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Important limitation" })).toBeInTheDocument();
  });

  it("uses RTL for Arabic and adapts the route after the answer", async () => {
    const user = userEvent.setup();
    render(<CaseWorkspace />);
    await selectSampleAndWaitUntilReady(user);
    await user.click(screen.getByRole("radio", { name: /Arabic/i }));
    await user.click(screen.getByRole("button", { name: "Run mock analysis" }));

    const result = await screen.findByTestId("analysis-result", {}, { timeout: 3_000 });
    expect(result).toHaveAttribute("dir", "rtl");
    expect(result).toHaveAttribute("lang", "ar");
    expect(screen.getByRole("heading", { name: "خطواتك التالية" })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "موظف" }));

    expect(await screen.findByText("تم تحديث المسار وفق إجابتك")).toBeInTheDocument();
    expect(screen.getByText("إثبات دخل من الوظيفة")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("dir", "ltr");
  });
});
