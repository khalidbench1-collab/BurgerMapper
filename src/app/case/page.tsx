import type { Metadata } from "next";

import { AppFooter } from "@/components/app-footer";
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

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f2eb] text-[#17231d]">
      <AppHeader />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-8 max-w-3xl print:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
            New case
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17251e] sm:text-4xl">
            Build a clear route from your goal
          </h1>
          <p className="mt-3 text-base leading-7 text-[#5f6c65]">
            Start in your own words, attach a letter if you have one, and select Guide me to build your route.
          </p>
        </header>
        <CaseWorkspace initialCategory={initialCategory} />
      </main>
      <AppFooter />
    </div>
  );
}
