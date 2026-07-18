import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { CaseWorkspace } from "@/components/case/case-workspace";

export const metadata: Metadata = {
  title: "New case | BurgerMapper",
  description: "Build a local mock route from a German official letter.",
};

export default function CasePage() {
  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#17231d]">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-8 max-w-3xl print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
            New case
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17251e] sm:text-4xl">
            Build a clear route from your letter
          </h1>
          <p className="mt-3 text-base leading-7 text-[#5f6c65]">
            Start with the document and your preferred output language. The mock result keeps extracted facts, interpretation, uncertainty, actions, and sources visibly separate.
          </p>
        </header>
        <CaseWorkspace />
      </main>
    </div>
  );
}
