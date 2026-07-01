import { describe, it, expect } from 'vitest'
import {
  validateAyatRange,
  clampAyatValue,
  MAX_AYATS_PER_VIDEO,
} from './validation'
import type { Surah } from './types'

// A representative surah for testing — Al-Fatihah has 7 ayats.
const AL_FATIHAH: Surah = {
  number: 1,
  name: 'Al-Fatihah',
  englishName: 'The Opening',
  arabicName: 'الفاتحة',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
}

const AL_BAQARAH: Surah = {
  number: 2,
  name: 'Al-Baqarah',
  englishName: 'The Cow',
  arabicName: 'البقرة',
  numberOfAyahs: 286,
  revelationType: 'Medinan',
}

describe('validateAyatRange', () => {
  describe('happy path', () => {
    it('accepts a single-ayat range (from === to)', () => {
      expect(validateAyatRange(1, 1, AL_FATIHAH)).toEqual({ ok: true })
    })

    it('accepts a 10-ayat range (the maximum allowed)', () => {
      expect(validateAyatRange(1, 10, AL_BAQARAH)).toEqual({ ok: true })
    })

    it('accepts a range in the middle of a long surah', () => {
      expect(validateAyatRange(100, 109, AL_BAQARAH)).toEqual({ ok: true })
    })

    it('accepts the last ayat of a surah', () => {
      expect(validateAyatRange(7, 7, AL_FATIHAH)).toEqual({ ok: true })
    })

    it('accepts a range when no surah is provided (skip ayat-count check)', () => {
      expect(validateAyatRange(1, 5, undefined)).toEqual({ ok: true })
    })
  })

  describe('max-10-ayat rule', () => {
    it('rejects an 11-ayat range with the correct message', () => {
      const result = validateAyatRange(1, 11, AL_BAQARAH)
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/maximum 10 ayats/i)
    })

    it('rejects a 50-ayat range', () => {
      const result = validateAyatRange(1, 50, AL_BAQARAH)
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/maximum 10 ayats/i)
    })

    it('reports the max count in the error message', () => {
      const result = validateAyatRange(1, 11, AL_BAQARAH)
      expect(result.error).toContain(String(MAX_AYATS_PER_VIDEO))
    })
  })

  describe('from vs to ordering', () => {
    it('rejects from > to', () => {
      const result = validateAyatRange(5, 3, AL_BAQARAH)
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/from must be less than to/i)
    })

    it('rejects from === 0', () => {
      const result = validateAyatRange(0, 1, AL_FATIHAH)
      expect(result.ok).toBe(false)
    })

    it('rejects negative ayat numbers', () => {
      const result = validateAyatRange(-1, 1, AL_FATIHAH)
      expect(result.ok).toBe(false)
    })
  })

  describe('surah ayat-count bounds', () => {
    it('rejects to > surah.numberOfAyahs', () => {
      const result = validateAyatRange(1, 8, AL_FATIHAH) // 7 ayats only
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/only has 7 ayats/i)
    })

    it('rejects from > surah.numberOfAyahs (when to is also out of bounds)', () => {
      // When from=10 and to=10, both exceed the surah's 7 ayats. The
      // implementation checks `to` first, so the error mentions the total
      // count. This is fine — both are out of bounds and the message is
      // actionable.
      const result = validateAyatRange(10, 10, AL_FATIHAH)
      expect(result.ok).toBe(false)
      expect(result.error).toMatch(/7 ayats/i)
    })

    it('rejects from > surah.numberOfAyahs (when to is in bounds)', () => {
      // from=10 > 7 ayats, but to=7 is in bounds. The `to` check passes,
      // the `from` check fires.
      const result = validateAyatRange(10, 7, AL_FATIHAH)
      expect(result.ok).toBe(false)
      // from > to also fails, but that check runs before the surah check.
      // Either error is acceptable here — both indicate an invalid range.
    })

    it('mentions the actual ayat count when to exceeds it', () => {
      const result = validateAyatRange(5, 8, AL_FATIHAH) // 5..8, 8 > 7
      expect(result.error).toContain('7')
    })
  })

  describe('invalid input types', () => {
    it('rejects NaN', () => {
      expect(validateAyatRange(NaN, 1, AL_FATIHAH).ok).toBe(false)
      expect(validateAyatRange(1, NaN, AL_FATIHAH).ok).toBe(false)
    })

    it('rejects Infinity', () => {
      expect(validateAyatRange(Infinity, 1, AL_FATIHAH).ok).toBe(false)
    })
  })
})

describe('clampAyatValue', () => {
  it('returns 1 for values < 1', () => {
    expect(clampAyatValue(0, 7)).toBe(1)
    expect(clampAyatValue(-5, 7)).toBe(1)
  })

  it('returns 1 for NaN', () => {
    expect(clampAyatValue(NaN, 7)).toBe(1)
  })

  it('clamps to max when value exceeds it', () => {
    expect(clampAyatValue(10, 7)).toBe(7)
    expect(clampAyatValue(1000, 7)).toBe(7)
  })

  it('passes through valid values unchanged', () => {
    expect(clampAyatValue(3, 7)).toBe(3)
    expect(clampAyatValue(7, 7)).toBe(7)
  })

  it('passes through when max is undefined', () => {
    expect(clampAyatValue(500, undefined)).toBe(500)
  })
})
