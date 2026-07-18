import {
  BUREAUCRACY_CATEGORIES,
  getCategoryDefinition,
  type BureaucracyCategory,
} from "@/domain/categories";

export function CategorySelector({
  value,
  onChange,
  disabled = false,
}: {
  value: BureaucracyCategory | null;
  onChange: (category: BureaucracyCategory | null) => void;
  disabled?: boolean;
}) {
  const selected = value ? getCategoryDefinition(value) : null;

  return (
    <section aria-labelledby="category-heading" className="rounded-2xl border border-[#d6dbd7] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
            Optional orientation
          </p>
          <h2 id="category-heading" className="mt-2 text-lg font-semibold text-[#1d2b24]">
            What area does this relate to?
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#68736d]">
            Choose a shortcut if it helps. Categories do not determine eligibility.
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <label htmlFor="case-category" className="sr-only">
            Bureaucracy category
          </label>
          <select
            id="case-category"
            value={value ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange((event.target.value || null) as BureaucracyCategory | null)
            }
            className="w-full rounded-xl border border-[#bfc8c2] bg-white px-3 py-2.5 text-sm font-semibold text-[#2e3e35] outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">No category / I&apos;m not sure</option>
            {BUREAUCRACY_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div aria-live="polite" className="mt-4 min-h-12 rounded-xl bg-[#f5f7f4] px-4 py-3 text-sm leading-6 text-[#58655e]">
        {selected ? (
          <p>
            <span className="font-semibold text-[#26362e]">{selected.label}: </span>
            {selected.description} Examples: {selected.examples.join(", ")}.
          </p>
        ) : (
          <p>Continue without a category if none of these feels right.</p>
        )}
      </div>
    </section>
  );
}
