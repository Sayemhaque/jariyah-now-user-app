import type { Surah } from './types'
import { maxAyatsPerVideo } from '@/lib/constants'

export { maxAyatsPerVideo }

export interface RangeValidation {
  ok: boolean
  error?: string
  warn?: string
}

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
  if (count > maxAyatsPerVideo) {
    return { ok: false, error: `Maximum ${maxAyatsPerVideo} ayats allowed per video` }
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

export function clampAyatValue(value: number, max: number | undefined): number {
  if (!Number.isFinite(value) || value < 1) return 1
  if (max && value > max) return max
  return value
}
