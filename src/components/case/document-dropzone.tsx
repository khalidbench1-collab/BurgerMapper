"use client";

import { useRef, useState } from "react";

import { FILE_PICKER_ACCEPT } from "@/lib/file-validation";
import { MOCK_SERVER_PRIVACY_MESSAGE } from "@/lib/privacy-messages";

interface DocumentDropzoneProps {
  disabled?: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
}

export function DocumentDropzone({
  disabled = false,
  error,
  onFileSelected,
}: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectFirstFile(files: FileList | null) {
    const file = files?.item(0);
    if (file) onFileSelected(file);
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) selectFirstFile(event.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors sm:px-8 ${
          isDragging
            ? "border-[#237b59] bg-[#eef7f2]"
            : error
              ? "border-[#bd5b42] bg-[#fff8f5]"
              : "border-[#cbd1cc] bg-[#fafaf7]"
        }`}
      >
        <input
          ref={inputRef}
          id="document-file"
          type="file"
          aria-label="Choose a PDF or image letter"
          accept={FILE_PICKER_ACCEPT}
          disabled={disabled}
          aria-describedby="document-formats document-privacy document-error"
          className="sr-only"
          onChange={(event) => {
            selectFirstFile(event.target.files);
            event.target.value = "";
          }}
        />
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6dbd7] bg-white text-xl text-[#315247]"
        >
          ↑
        </div>
        <p className="text-base font-semibold text-[#1b2922]">
          Drop your official letter here
        </p>
        <p id="document-formats" className="mt-2 text-sm leading-6 text-[#66716b]">
          PDF, PNG, JPEG, or WebP · maximum 10 MB
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-xl border border-[#aeb8b2] bg-white px-4 py-2.5 text-sm font-semibold text-[#203129] shadow-sm outline-none hover:border-[#65756d] focus-visible:ring-3 focus-visible:ring-[#176b4d]/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Choose a file
        </button>
      </div>

      <p id="document-error" role="alert" className="min-h-6 text-sm font-medium text-[#a33f2d]">
        {error}
      </p>

      <aside id="document-privacy" className="rounded-xl border border-[#d9ddd7] bg-white p-4">
        <p className="text-sm font-semibold text-[#26362e]">In-memory mock processing</p>
        <p className="mt-1 text-sm leading-6 text-[#68736d]">
          {MOCK_SERVER_PRIVACY_MESSAGE}
        </p>
      </aside>
    </div>
  );
}
