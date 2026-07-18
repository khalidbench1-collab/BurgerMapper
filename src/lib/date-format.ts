import type { SupportedLanguage } from "@/domain/case";
import { DATE_LOCALES } from "@/i18n/case-copy";

export function formatCaseDate(
  isoDate: string,
  language: SupportedLanguage,
): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (!isoDate || Number.isNaN(parsed.getTime())) {
    return language === "de" ? "Nicht erkannt" : language === "ar" ? "لم يتم التعرّف عليه" : "Not detected";
  }
  return new Intl.DateTimeFormat(DATE_LOCALES[language], {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}
