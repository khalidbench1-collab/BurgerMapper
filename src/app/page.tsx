import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { CategoryShortcuts } from "@/components/category-shortcuts";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#17231d]">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-18 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-18">
          <section>
            <p className="inline-flex rounded-full border border-[#c9d8d0] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#24644a]">
              Berlin-first bureaucracy navigator
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.05em] text-[#142219] text-balance sm:text-6xl">
              Start with what you need to get done.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#536159] sm:text-xl sm:leading-9">
              Describe your goal in everyday language. Add a letter only if you have one, then build a clear fictional mock route.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/case"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1d664b] px-6 py-3 text-base font-semibold text-white shadow-sm outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
              >
                Describe your goal
                <span aria-hidden="true" className="ms-2">→</span>
              </Link>
              <p className="max-w-xs text-sm leading-6 text-[#68736d]">
                Mock mode only. Inputs are validated in memory by the BurgerMapper server, never sent to an AI provider, and discarded after the request.
              </p>
            </div>
          </section>

          <aside aria-label="How BurgerMapper works" className="rounded-[1.5rem] border border-[#d5dad6] bg-white p-6 shadow-[0_18px_60px_rgba(29,47,38,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
              A route, not a chat
            </p>
            <ol className="mt-5 space-y-5">
              <RoutePreview number="1" title="Describe the outcome" description="Start without knowing the official procedure name." />
              <RoutePreview number="2" title="Clarify what matters" description="Answer one question only when it can change the route." />
              <RoutePreview number="3" title="Follow a structured route" description="See deadlines, documents, uncertainty, and source placeholders in one plan." />
            </ol>
          </aside>
        </div>
        <CategoryShortcuts />
      </main>
    </div>
  );
}

function RoutePreview({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="grid grid-cols-[2.25rem_1fr] gap-3">
      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef6f2] text-sm font-bold text-[#1f6d50]">
        {number}
      </span>
      <div>
        <h2 className="font-semibold text-[#223129]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#68736d]">{description}</p>
      </div>
    </li>
  );
}
