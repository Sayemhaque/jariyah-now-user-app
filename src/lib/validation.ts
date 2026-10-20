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
    return { ok: false, error: 'সঠিক আয়াত নম্বর দিন' }
  }
  if (from < 1 || to < 1) {
    return { ok: false, error: 'আয়াত নম্বর ১ বা তার বেশি হতে হবে' }
  }
  if (from > to) {
    return { ok: false, error: 'শুরুর আয়াত শেষের আয়াতের চেয়ে ছোট হতে হবে' }
  }
  const count = to - from + 1
  if (count > maxAyatsPerVideo) {
    return { ok: false, error: `একটি ভিডিওতে সর্বোচ্চ ${maxAyatsPerVideo}টি আয়াত নেওয়া যায়` }
  }
  if (surah && surah.numberOfAyahs > 0) {
    if (to > surah.numberOfAyahs) {
      return {
        ok: false,
        error: `এই সূরায় মোট ${surah.numberOfAyahs}টি আয়াত আছে`,
      }
    }
    if (from > surah.numberOfAyahs) {
      return {
        ok: false,
        error: `শুরুর আয়াত সূরার মোট ${surah.numberOfAyahs}টি আয়াতের বেশি হয়ে গেছে`,
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
