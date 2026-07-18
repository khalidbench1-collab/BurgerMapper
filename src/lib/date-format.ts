import type { SupportedLanguage } from "@/domain/case";
import { DATE_LOCALES } from "@/i18n/case-copy";

export function formatCaseDate(
  isoDate: string,
  language: SupportedLanguage,
): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[language], {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
