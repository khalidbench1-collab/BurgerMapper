import Link from "next/link";

import { MockModeBadge } from "@/components/case/mock-mode-badge";

export function AppHeader() {
  return (
    <header className="border-b border-[#d9ddd7] bg-white">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#15221c] outline-none focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-[-0.03em] text-[#15221c] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
          >
            BurgerMapper
          </Link>
          <span className="rounded-full border border-[#c9d8d0] bg-[#eef7f2] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#1f6d50]">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-[#68736d] sm:inline">
            Independent guide — not an official service
          </span>
          <MockModeBadge mode="openai" label="AI analysis" />
        </div>
      </div>
    </header>
  );
}
