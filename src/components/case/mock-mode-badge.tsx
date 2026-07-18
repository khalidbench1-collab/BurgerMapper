export function MockModeBadge({ label = "Mock mode" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#bfd6ca] bg-[#eef7f2] px-3 py-1 text-xs font-semibold text-[#155c43]">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#237b59]" />
      {label}
    </span>
  );
}
