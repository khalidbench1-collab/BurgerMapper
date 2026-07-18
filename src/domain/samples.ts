export const FICTIONAL_SAMPLE_ID = "fictional-residence-renewal-2026";

export const KNOWN_SAMPLE_IDS = [FICTIONAL_SAMPLE_ID] as const;

export type KnownSampleId = (typeof KNOWN_SAMPLE_IDS)[number];

export function isKnownSampleId(value: string): value is KnownSampleId {
  return KNOWN_SAMPLE_IDS.includes(value as KnownSampleId);
}
