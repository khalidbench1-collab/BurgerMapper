export const MIN_PASTED_TEXT_NON_WHITESPACE = 20;
export const MAX_PASTED_TEXT_CHARACTERS = 20_000;

export type TextValidationResult =
  | { valid: true; normalizedText: string }
  | { valid: false; error: string };

export function normalizePastedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validatePastedText(text: string): TextValidationResult {
  if (text.length > MAX_PASTED_TEXT_CHARACTERS) {
    return {
      valid: false,
      error: "Keep pasted text to 20,000 characters or fewer.",
    };
  }

  const normalizedText = normalizePastedText(text);
  const usefulCharacterCount = normalizedText.replace(/\s/g, "").length;

  if (usefulCharacterCount === 0) {
    return {
      valid: false,
      error: "Paste the letter, email, or official message before continuing.",
    };
  }

  if (usefulCharacterCount < MIN_PASTED_TEXT_NON_WHITESPACE) {
    return {
      valid: false,
      error: "Add at least 20 non-whitespace characters so the message is useful.",
    };
  }

  return { valid: true, normalizedText };
}
