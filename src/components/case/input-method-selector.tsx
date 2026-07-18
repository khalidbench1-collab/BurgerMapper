import type { EvidenceInputKind } from "@/domain/case";

const methods: Array<{
  value: EvidenceInputKind;
  label: string;
  description: string;
}> = [
  {
    value: "none",
    label: "Goal only",
    description: "Continue without a document",
  },
  {
    value: "text",
    label: "Paste text",
    description: "Email, portal message, letter, or SMS",
  },
  {
    value: "file",
    label: "Upload document",
    description: "PDF or image up to 10 MB",
  },
  {
    value: "sample",
    label: "Try sample",
    description: "Fictional residence-renewal letter",
  },
];

export function InputMethodSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: EvidenceInputKind;
  onChange: (kind: EvidenceInputKind) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold text-[#26362e]">Would you like to add evidence?</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map((method) => (
          <label
            key={method.value}
            className={`cursor-pointer rounded-xl border px-4 py-3 outline-none has-focus-visible:ring-3 has-focus-visible:ring-[#176b4d]/35 ${
              value === method.value
                ? "border-[#237b59] bg-[#eef7f2]"
                : "border-[#d4d9d5] bg-white hover:border-[#89968f]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="input-method"
                value={method.value}
                aria-label={method.label}
                checked={value === method.value}
                onChange={() => onChange(method.value)}
                className="h-4 w-4 accent-[#237b59]"
              />
              <span className="text-sm font-semibold text-[#26362e]">{method.label}</span>
            </span>
            <span className="mt-1.5 block text-xs leading-5 text-[#6a756e]">
              {method.description}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
