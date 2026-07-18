import type { BureaucracyCategory } from "@/domain/categories";
import type { InputKind, SupportedLanguage } from "@/domain/case";
import type { ClarificationResolution } from "@/domain/case";
import type { KnownSampleId } from "@/domain/samples";

export interface NormalizedFileMetadata {
  filename: string;
  claimedMimeType: string;
  detectedMimeType: SupportedFileMimeType;
  sizeBytes: number;
}

export type SupportedFileMimeType =
  | "application/pdf"
  | "image/png"
  | "image/jpeg"
  | "image/webp";

interface NormalizedCaseInputBase {
  kind: InputKind;
  category: BureaucracyCategory | null;
  outputLanguage: SupportedLanguage;
  receivedAt: string;
  normalizedGoal: string | null;
  clarificationResolution?: ClarificationResolution | null;
}

export type NormalizedCaseInput =
  | (NormalizedCaseInputBase & {
      kind: "goal";
      normalizedGoal: string;
    })
  | (NormalizedCaseInputBase & {
      kind: "text";
      normalizedText: string;
    })
  | (NormalizedCaseInputBase & {
      kind: "file";
      file: {
        metadata: NormalizedFileMetadata;
        bytes: Uint8Array;
      };
    })
  | (NormalizedCaseInputBase & {
      kind: "sample";
      sampleId: KnownSampleId;
    });
