import type { UploadedDocument } from "@/domain/case";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const FILE_PICKER_ACCEPT = ACCEPTED_FILE_TYPES.join(",");

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateDocumentFile(file: File): FileValidationResult {
  if (!ACCEPTED_FILE_TYPES.includes(file.type as (typeof ACCEPTED_FILE_TYPES)[number])) {
    return {
      valid: false,
      error: "Choose a PDF, PNG, JPEG, or WebP document.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "This file is larger than 10 MB. Choose a smaller document.",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "This file is empty. Choose a document that contains data.",
    };
  }

  return { valid: true };
}

export function createUploadedDocument(file: File): UploadedDocument {
  return {
    id: `upload-${Date.now()}`,
    file,
    metadata: {
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      selectedAt: new Date().toISOString(),
      source: "upload",
    },
  };
}

export function createSampleDocument(): UploadedDocument {
  return {
    id: "sample-residence-renewal-request",
    metadata: {
      name: "fictional-residence-renewal-letter.pdf",
      mimeType: "application/pdf",
      sizeBytes: 248_000,
      selectedAt: new Date().toISOString(),
      source: "sample",
    },
  };
}

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
