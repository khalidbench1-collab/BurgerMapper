import Link from "next/link";

import { MockModeBadge } from "@/components/case/mock-mode-badge";

export function AppHeader() {
  return (
    <header className="border-b border-[#d9ddd7] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="rounded-md text-lg font-semibold tracking-[-0.03em] text-[#15221c] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
        >
          BurgerMapper
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-[#68736d] sm:inline">
            Build Week · Phase 1
          </span>
          <MockModeBadge />
        </div>
      </div>
    </header>
  );
}
