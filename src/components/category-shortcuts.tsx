import Link from "next/link";

import { BUREAUCRACY_CATEGORIES } from "@/domain/categories";

export function CategoryShortcuts() {
  return (
    <section aria-labelledby="category-shortcuts-heading" className="mt-14 border-t border-[#d8ddd8] pt-10 sm:mt-18 sm:pt-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
          Start where you are
        </p>
        <h2 id="category-shortcuts-heading" className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#18271f] sm:text-3xl">
          Choose an area—or skip this step
        </h2>
        <p className="mt-3 text-base leading-7 text-[#5f6c65]">
          You do not need to know the official procedure name. These shortcuts only orient the case and never decide eligibility.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUREAUCRACY_CATEGORIES.map((category, index) => (
          <Link
            key={category.id}
            href={{ pathname: "/case", query: { category: category.id } }}
            className="group rounded-2xl border border-[#d3d9d5] bg-white p-5 outline-none hover:border-[#82978c] hover:shadow-[0_10px_30px_rgba(29,47,38,0.06)] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
          >
            <span aria-hidden="true" className="text-xs font-bold text-[#237b59]">
              0{index + 1}
            </span>
            <h3 className="mt-3 font-semibold text-[#223129] group-hover:text-[#155c43]">
              {category.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#66716b]">
              {category.description}
            </p>
            <p className="mt-3 text-xs leading-5 text-[#67716b]">
              {category.examples.join(" · ")}
            </p>
          </Link>
        ))}
      </div>

      <Link
        href="/case"
        className="mt-6 inline-flex rounded-lg px-2 py-2 text-sm font-semibold text-[#1c6549] underline decoration-[#9abbaa] underline-offset-4 outline-none hover:text-[#104b35] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35"
      >
        I&apos;m not sure — start a general case
      </Link>
    </section>
  );
}
