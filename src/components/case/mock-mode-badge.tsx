export function MockModeBadge({
  label = "Demo mode",
  mode = "mock",
}: {
  label?: string;
  mode?: "mock" | "openai";
}) {
  return (
    <span className={mode === "openai" ? "inline-flex items-center gap-2 rounded-full border border-[#b8c9d8] bg-[#eef5fa] px-3 py-1 text-xs font-semibold text-[#234f70]" : "inline-flex items-center gap-2 rounded-full border border-[#bfd6ca] bg-[#eef7f2] px-3 py-1 text-xs font-semibold text-[#155c43]"}>
      <span aria-hidden="true" className={mode === "openai" ? "h-1.5 w-1.5 rounded-full bg-[#39749d]" : "h-1.5 w-1.5 rounded-full bg-[#237b59]"} />
      {label}
    </span>
  );
}
