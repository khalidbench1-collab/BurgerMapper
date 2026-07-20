"use client";

import { useEffect, useRef, useState } from "react";

import type { SupportedLanguage } from "@/domain/case";
import { LANGUAGE_OPTIONS } from "@/i18n/case-copy";

export function LanguageMenu({
  value,
  onChange,
  disabled = false,
}: {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = LANGUAGE_OPTIONS.find((option) => option.value === value) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function select(language: SupportedLanguage) {
    onChange(language);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Output language: ${selected.label}`}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6d7871] outline-none hover:bg-[#f0f4f1] hover:text-[#41504a] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
        </svg>
        {selected.label}
        <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Output language"
          className="absolute bottom-full end-0 z-20 mb-2 min-w-[11rem] rounded-xl border border-[#d3d8d4] bg-white p-1 shadow-[0_12px_30px_rgba(29,47,38,0.16)]"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => select(option.value)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start outline-none focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 ${
                option.value === value
                  ? "bg-[#eef7f2] text-[#155c43]"
                  : "text-[#314139] hover:bg-[#f4f7f5]"
              }`}
            >
              <span>
                <span className="block text-sm font-semibold">{option.label}</span>
                {option.nativeLabel !== option.label ? (
                  <span
                    className="mt-0.5 block text-xs opacity-75"
                    lang={option.value}
                    dir={option.value === "ar" ? "rtl" : "ltr"}
                  >
                    {option.nativeLabel}
                  </span>
                ) : null}
              </span>
              {option.value === value ? (
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
