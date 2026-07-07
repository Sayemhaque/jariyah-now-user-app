/**
 * Convert Western digits (0-9) to Arabic-Indic digits (٠-٩) which are
 * traditionally used in Quran manuscripts for ayah numbers.
 *
 * Example: 255 → ٢٥٥
 */
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]!)
}
