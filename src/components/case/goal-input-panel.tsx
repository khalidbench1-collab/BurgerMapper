import {
  MAX_GOAL_CHARACTERS,
  MIN_GOAL_MEANINGFUL_CHARACTERS,
} from "@/lib/goal-validation";

export function GoalInputPanel({
  value,
  error,
  onChange,
  disabled = false,
  mode = "mock",
}: {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  mode?: "mock" | "openai";
}) {
  return (
    <section className="rounded-[1.5rem] border border-[#bfcfc6] bg-white p-5 shadow-[0_14px_45px_rgba(29,47,38,0.06)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#237b59]">
        Start with your goal
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="goal-heading" className="text-xl font-semibold text-[#1d2b24]">
            What do you need to get done?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68736d]">
            Describe the outcome in your own words. You do not need to know the
            official German procedure name.
          </p>
        </div>
        <span id="goal-character-count" className="shrink-0 text-xs font-medium text-[#6d7871]">
          {value.length.toLocaleString("en-US")} / {MAX_GOAL_CHARACTERS.toLocaleString("en-US")}
        </span>
      </div>
      <label htmlFor="case-goal" className="sr-only">
        What do you need to get done?
      </label>
      <textarea
        id="case-goal"
        value={value}
        maxLength={MAX_GOAL_CHARACTERS}
        rows={4}
        disabled={disabled}
        aria-describedby="goal-help goal-character-count goal-validation-error"
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="For example: I need to renew my residence permit and understand what documents are missing."
        className={`mt-5 w-full resize-y rounded-2xl border bg-[#fcfcfa] px-4 py-3 text-base leading-7 text-[#27352e] outline-none placeholder:text-[#87918b] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-[#bd5b42]" : "border-[#aebdb5]"
        }`}
      />
      <p id="goal-validation-error" role="alert" className="mt-2 min-h-6 text-sm font-medium text-[#a33f2d]">
        {error}
      </p>
      <p id="goal-help" className="mt-1 text-sm leading-6 text-[#68736d]">
        Use at least {MIN_GOAL_MEANINGFUL_CHARACTERS} non-whitespace characters.
        Your goal stays in browser/request memory and is not logged or stored.{" "}
        {mode === "mock"
          ? "Demo mode does not send it to an AI provider."
          : "It is sent to OpenAI only after you agree below."}
      </p>
    </section>
  );
}
