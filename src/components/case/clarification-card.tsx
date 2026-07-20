"use client";

import { useState } from "react";

import type {
  CaseAnalysis,
  ClarificationAnswerId,
} from "@/domain/case";
import { RESULT_COPY } from "@/i18n/case-copy";

export const CUSTOM_CLARIFICATION_ANSWER_ID = "custom-answer";
const VISIBLE_OPTION_COUNT = 2;

export function ClarificationCard({
  analysis,
  onAnswer,
  onAnswerText,
}: {
  analysis: CaseAnalysis;
  onAnswer: (answer: ClarificationAnswerId) => void;
  onAnswerText?: (text: string) => void;
}) {
  const copy = RESULT_COPY[analysis.outputLanguage];
  const question = analysis.clarificationQuestion;
  const options = question.options.slice(0, VISIBLE_OPTION_COUNT);
  const customSelected = question.selectedAnswerId === CUSTOM_CLARIFICATION_ANSWER_ID;
  const [customText, setCustomText] = useState("");

  function submitCustomAnswer() {
    const text = customText.trim();
    if (text && onAnswerText) onAnswerText(text);
  }

  return (
    <section aria-labelledby="clarification-heading" className="rounded-2xl border-2 border-[#e3b276] bg-[#fffaf0] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b5a20]">
        {copy.clarification}
      </p>
      <h2 id="clarification-heading" className="mt-2 text-xl font-semibold leading-8 text-[#382b1c]">
        {question.prompt}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#6d5b44]">
        <span className="font-semibold">{copy.whyWeAsk}: </span>
        {question.reason}
      </p>

      <fieldset className="mt-5">
        <legend className="sr-only">{question.prompt}</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => {
            const selected = question.selectedAnswerId === option.id;
            return (
              <label
                key={option.id}
                className={`cursor-pointer rounded-xl border p-4 outline-none has-focus-visible:ring-3 has-focus-visible:ring-[#9b6728]/30 ${
                  selected
                    ? "border-[#9b6728] bg-white shadow-sm"
                    : "border-[#e2cfad] bg-[#fffdf8] hover:border-[#bb8a4e]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="clarification-answer"
                    value={option.id}
                    aria-label={option.label}
                    checked={selected}
                    onChange={() => onAnswer(option.id)}
                    className="h-4 w-4 accent-[#8b5a20]"
                  />
                  <span className="font-semibold text-[#3d3020]">{option.label}</span>
                </span>
                <span className="mt-2 block text-sm leading-5 text-[#75644d]">
                  {option.routeImpact}
                </span>
              </label>
            );
          })}
          {onAnswerText ? (
            <div
              className={`rounded-xl border p-4 ${
                customSelected
                  ? "border-[#9b6728] bg-white shadow-sm"
                  : "border-[#e2cfad] bg-[#fffdf8]"
              }`}
            >
              <label htmlFor="clarification-custom-answer" className="font-semibold text-[#3d3020]">
                {copy.typeAnswerLabel}
              </label>
              <input
                id="clarification-custom-answer"
                type="text"
                maxLength={500}
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitCustomAnswer();
                  }
                }}
                placeholder={copy.typeAnswerPlaceholder}
                className="mt-3 w-full rounded-lg border border-[#dcc69c] bg-white px-3 py-2 text-sm text-[#3d3020] outline-none placeholder:text-[#a89877] focus-visible:ring-3 focus-visible:ring-[#9b6728]/30"
              />
              <button
                type="button"
                disabled={!customText.trim()}
                onClick={submitCustomAnswer}
                className="mt-3 rounded-lg bg-[#8b5a20] px-4 py-2 text-sm font-semibold text-white outline-none hover:bg-[#744a19] focus-visible:ring-3 focus-visible:ring-[#9b6728]/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.typeAnswerSubmit}
              </button>
            </div>
          ) : null}
        </div>
      </fieldset>

      <p aria-live="polite" className="mt-4 min-h-6 text-sm font-semibold text-[#6c4518]">
        {question.selectedAnswerId ? copy.routeUpdated : ""}
      </p>
    </section>
  );
}
