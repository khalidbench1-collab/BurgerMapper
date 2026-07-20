"use client";

import { useRef, type ReactNode } from "react";

import type { UploadedDocument } from "@/domain/case";
import { FILE_PICKER_ACCEPT, formatFileSize } from "@/lib/file-validation";
import { MAX_GOAL_CHARACTERS } from "@/lib/goal-validation";

export function GoalInputPanel({
  value,
  error,
  onChange,
  disabled = false,
  document = null,
  uploadError = null,
  onFileSelected,
  onRemoveDocument,
  action,
}: {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  document?: UploadedDocument | null;
  uploadError?: string | null;
  onFileSelected?: (file: File) => void;
  onRemoveDocument?: () => void;
  action?: ReactNode;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="relative mt-5">
        <textarea
          id="case-goal"
          value={value}
          maxLength={MAX_GOAL_CHARACTERS}
          rows={4}
          disabled={disabled}
          aria-describedby="goal-character-count goal-validation-error"
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="For example: I need to renew my residence permit and understand what documents are missing."
          className={`w-full resize-y rounded-2xl border bg-[#fcfcfa] px-4 py-3 pe-14 text-base leading-7 text-[#27352e] outline-none placeholder:text-[#87918b] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-[#bd5b42]" : "border-[#aebdb5]"
          }`}
        />
        {onFileSelected ? (
          <>
            <input
              ref={fileInputRef}
              id="goal-document-file"
              type="file"
              aria-label="Attach a PDF or image"
              accept={FILE_PICKER_ACCEPT}
              disabled={disabled}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.item(0);
                if (file) onFileSelected(file);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach a PDF or image (optional)"
              title="Attach a PDF or image (optional)"
              className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#9aa6a0] outline-none hover:bg-[#f0f4f1] hover:text-[#5d6862] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
            </button>
          </>
        ) : null}
      </div>
      {document && onRemoveDocument ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#cdd5d0] bg-[#f8fbf9] px-4 py-2.5">
          <p className="min-w-0 truncate text-sm text-[#31413a]">
            <span className="font-semibold">{document.metadata.name}</span>
            <span className="ms-2 text-[#68736d]">
              {formatFileSize(document.metadata.sizeBytes)} · in memory only
            </span>
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemoveDocument}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#8c3b2c] outline-none hover:bg-[#f9e9e5] focus-visible:ring-3 focus-visible:ring-[#a94d36]/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : null}
      <p id="goal-validation-error" role="alert" className="mt-2 min-h-6 text-sm font-medium text-[#a33f2d]">
        {[error, uploadError].filter(Boolean).join(" ")}
      </p>
      {action ? <div className="mt-1">{action}</div> : null}
    </section>
  );
}
