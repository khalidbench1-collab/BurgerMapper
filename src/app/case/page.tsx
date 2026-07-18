import type { Metadata } from "next";

import { AppHeader } from "@/components/app-header";
import { CaseWorkspace } from "@/components/case/case-workspace";
import { isBureaucracyCategory } from "@/domain/categories";

export const metadata: Metadata = {
  title: "New case | BurgerMapper",
  description: "Build a clear route from your goal and optional evidence.",
};

export default async function CasePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
  }>;
}) {
  const categoryParam = (await searchParams).category;
  const initialCategory =
    typeof categoryParam === "string" && isBureaucracyCategory(categoryParam)
      ? categoryParam
      : null;
  const analysisMode = process.env.ENABLE_MOCK_AI?.trim().toLowerCase() === "false" ? "openai" : "mock";

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#17231d]">
      <AppHeader mode={analysisMode} />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-8 max-w-3xl print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
            New case
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17251e] sm:text-4xl">
            Build a clear route from your goal
          </h1>
          <p className="mt-3 text-base leading-7 text-[#5f6c65]">
            {analysisMode === "mock"
              ? "Start in your own words, then add an optional category, pasted message, PDF, image, or fictional sample. Mock mode validates inputs in memory but does not interpret them or contact an AI provider."
              : "Start in your own words, then add optional context. Before analysis, you decide whether to send the case securely from BurgerMapper to OpenAI."}
          </p>
        </header>
        <CaseWorkspace initialCategory={initialCategory} analysisMode={analysisMode} />
      </main>
    </div>
  );
}
