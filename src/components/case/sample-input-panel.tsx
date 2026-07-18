export const FICTIONAL_SAMPLE_ID = "fictional-residence-renewal-2026";

export function SampleInputPanel({
  selected,
  onSelect,
  disabled = false,
}: {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#cdd5d0] bg-[#f8fbf9] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#237b59]">
        Fictional test case
      </p>
      <h3 className="mt-2 text-base font-semibold text-[#1b2922]">
        Residence permit renewal follow-up
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#66716b]">
        A made-up Berlin letter requesting a passport copy, health-insurance proof, and recent income evidence. It contains no real personal data or government text.
      </p>
      <button
        type="button"
        disabled={disabled || selected}
        onClick={onSelect}
        className="mt-4 rounded-xl bg-[#1d664b] px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-[#15523c] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-default disabled:bg-[#8ca99b]"
      >
        {selected ? "Sample selected" : "Use fictional sample"}
      </button>
    </div>
  );
}
