import { MAX_PASTED_TEXT_CHARACTERS } from "@/lib/text-validation";
import { MOCK_SERVER_PRIVACY_MESSAGE } from "@/lib/privacy-messages";

export function TextInputPanel({
  value,
  error,
  onChange,
  disabled = false,
}: {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <label htmlFor="pasted-letter" className="text-sm font-semibold text-[#26362e]">
          Paste the letter, email, or official message here
        </label>
        <span id="text-character-count" className="shrink-0 text-xs font-medium text-[#6d7871]">
          {value.length.toLocaleString("en-US")} / {MAX_PASTED_TEXT_CHARACTERS.toLocaleString("en-US")}
        </span>
      </div>
      <textarea
        id="pasted-letter"
        value={value}
        maxLength={MAX_PASTED_TEXT_CHARACTERS}
        rows={11}
        disabled={disabled}
        aria-describedby="text-privacy text-character-count text-validation-error"
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste plain text here…"
        className={`mt-3 w-full resize-y rounded-2xl border bg-[#fcfcfa] px-4 py-3 text-sm leading-6 text-[#27352e] outline-none placeholder:text-[#8a948e] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-[#bd5b42]" : "border-[#c7cec9]"
        }`}
      />
      <p id="text-validation-error" role="alert" className="mt-2 min-h-6 text-sm font-medium text-[#a33f2d]">
        {error}
      </p>
      <p id="text-privacy" className="mt-2 text-sm leading-6 text-[#68736d]">
        {MOCK_SERVER_PRIVACY_MESSAGE}
      </p>
    </div>
  );
}
