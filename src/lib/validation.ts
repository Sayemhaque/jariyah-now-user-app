import type { Surah } from './types'
import { MAX_AYATS_PER_VIDEO } from '@/lib/constants'

export { MAX_AYATS_PER_VIDEO }

export interface RangeValidation {
  ok: boolean
  error?: string
  warn?: string
}

/**
 * Validate a from/to ayat range against the surah constraints.
 * The "max 10 ayats per video" rule means (to - from) must be <= 9,
 * i.e. at most 10 inclusive ayat indices.
 */
export function validateAyatRange(
  from: number,
  to: number,
  surah: Surah | undefined,
): RangeValidation {
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { ok: false, error: 'Enter valid ayat numbers' }
  }
  if (from < 1 || to < 1) {
    return { ok: false, error: 'Ayat numbers must be 1 or greater' }
  }
  if (from > to) {
    return { ok: false, error: 'From must be less than To' }
  }
  const count = to - from + 1
  if (count > MAX_AYATS_PER_VIDEO) {
    return { ok: false, error: `Maximum ${MAX_AYATS_PER_VIDEO} ayats allowed per video` }
  }
  if (surah && surah.numberOfAyahs > 0) {
    if (to > surah.numberOfAyahs) {
      return {
        ok: false,
        error: `This surah only has ${surah.numberOfAyahs} ayats`,
      }
    }
    if (from > surah.numberOfAyahs) {
      return {
        ok: false,
        error: `From exceeds the surah's ${surah.numberOfAyahs} ayats`,
      }
    }
  }
  return { ok: true }
}

/** A softer, "while typing" check that clamps instead of blocking. */
export function clampAyatValue(value: number, max: number | undefined): number {
  if (!Number.isFinite(value) || value < 1) return 1
  if (max && value > max) return max
  return value
}
