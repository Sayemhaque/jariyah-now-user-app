/**
 * Helpers for formatting the structural Quran markers (Juz, Hizb, Rubʿ
 * al-Hizb, Ruku, Manzil, Page) that come back from the quran.com API.
 *
 * Used by both the live preview (VideoPreview.tsx) and the export renderer
 * (ExportModal.tsx drawFrame) so the formatting stays consistent.
 */

export interface StructuralInfo {
  juzNumber?: number
  hizbNumber?: number
  rubElHizbNumber?: number
  rukuNumber?: number
  manzilNumber?: number
  pageNumber?: number
}

/**
 * Build an array of `{ label, value }` pairs for the structural markers
 * that are actually present on the verse. Omits undefined/null fields
 * so we never render empty labels.
 *
 * Example output for Al-Baqarah 2:255:
 *   [
 *     { label: 'Juz',    value: 3  },
 *     { label: 'Hizb',   value: 5  },
 *     { label: 'Rubʿ',   value: 17 },
 *     { label: 'Ruku',   value: 35 },
 *     { label: 'Manzil', value: 1  },
 *     { label: 'Page',   value: 42 },
 *   ]
 */
export function getStructuralPairs(
  info: StructuralInfo,
): Array<{ label: string; value: number }> {
  const pairs: Array<{ label: string; value: number }> = []
  if (typeof info.juzNumber === 'number') {
    pairs.push({ label: 'Juz', value: info.juzNumber })
  }
  if (typeof info.hizbNumber === 'number') {
    pairs.push({ label: 'Hizb', value: info.hizbNumber })
  }
  if (typeof info.rubElHizbNumber === 'number') {
    pairs.push({ label: 'Rubʿ', value: info.rubElHizbNumber })
  }
  if (typeof info.rukuNumber === 'number') {
    pairs.push({ label: 'Ruku', value: info.rukuNumber })
  }
  if (typeof info.manzilNumber === 'number') {
    pairs.push({ label: 'Manzil', value: info.manzilNumber })
  }
  if (typeof info.pageNumber === 'number') {
    pairs.push({ label: 'Page', value: info.pageNumber })
  }
  return pairs
}

/**
 * Format the structural markers as a single string for compact display.
 * Example: "Juz 3 · Hizb 5 · Rubʿ 17 · Ruku 35 · Page 42"
 *
 * Set `uppercase=true` for the exported video (matches the existing
 * uppercase style of the canvas header). Leave false for the live
 * preview (mixes better with the surah name).
 */
export function formatStructural(
  info: StructuralInfo,
  uppercase = false,
): string {
  const pairs = getStructuralPairs(info)
  if (!pairs.length) return ''
  const str = pairs.map((p) => `${p.label} ${p.value}`).join(' · ')
  return uppercase ? str.toUpperCase() : str
}
