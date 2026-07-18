import type { KnownSampleId } from "@/domain/samples";

const TRUSTED_SAMPLE_TEXT: Record<KnownSampleId, string> = {
  "fictional-residence-renewal-2026":
    "Fictional server-side sample: a Berlin immigration-office follow-up requests a current passport copy, proof of health insurance, and recent income evidence within fourteen days. The person's work status is intentionally unspecified. This is not government text.",
};

export function getTrustedSampleText(sampleId: KnownSampleId): string {
  return TRUSTED_SAMPLE_TEXT[sampleId];
}
