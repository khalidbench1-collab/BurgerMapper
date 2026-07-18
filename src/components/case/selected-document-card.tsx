import type { UploadedDocument } from "@/domain/case";
import { formatFileSize } from "@/lib/file-validation";

const TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF document",
  "image/png": "PNG image",
  "image/jpeg": "JPEG image",
  "image/webp": "WebP image",
};

export function SelectedDocumentCard({
  document,
  onRemove,
  disabled = false,
}: {
  document: UploadedDocument;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <section aria-labelledby="selected-document-heading" className="rounded-2xl border border-[#cdd5d0] bg-[#f8fbf9] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#237b59]">
            {document.metadata.source === "sample" ? "Fictional sample" : "Selected document"}
          </p>
          <h2 id="selected-document-heading" className="mt-2 break-words text-base font-semibold text-[#1b2922]">
            {document.metadata.name}
          </h2>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#657169]">
            <div>
              <dt className="sr-only">File type</dt>
              <dd>{TYPE_LABELS[document.metadata.mimeType] ?? document.metadata.mimeType}</dd>
            </div>
            <div>
              <dt className="sr-only">File size</dt>
              <dd>{formatFileSize(document.metadata.sizeBytes)}</dd>
            </div>
            <div>
              <dt className="sr-only">Processing</dt>
              <dd>Browser memory only</dd>
            </div>
          </dl>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-[#8c3b2c] outline-none hover:bg-[#f9e9e5] focus-visible:ring-3 focus-visible:ring-[#a94d36]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </section>
  );
}
