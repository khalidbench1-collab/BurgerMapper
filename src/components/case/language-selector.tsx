import type { SupportedLanguage } from "@/domain/case";
import { LANGUAGE_OPTIONS } from "@/i18n/case-copy";

export function LanguageSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold text-[#26362e]">Output language</legend>
      <p id="language-help" className="mt-1 text-sm leading-6 text-[#6a746f]">
        Choose the language for the explanation and route.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3" aria-describedby="language-help">
        {LANGUAGE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 outline-none transition-colors has-focus-visible:ring-3 has-focus-visible:ring-[#176b4d]/35 ${
              value === option.value
                ? "border-[#237b59] bg-[#eef7f2] text-[#155c43]"
                : "border-[#d3d8d4] bg-white text-[#314139] hover:border-[#8b9991]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span>
              <span className="block text-sm font-semibold">{option.label}</span>
              {option.nativeLabel !== option.label ? (
                <span className="mt-0.5 block text-xs opacity-75" lang={option.value} dir={option.value === "ar" ? "rtl" : "ltr"}>
                  {option.nativeLabel}
                </span>
              ) : null}
            </span>
            <input
              type="radio"
              name="output-language"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 accent-[#237b59]"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
