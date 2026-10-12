import { describe, it, expect } from 'vitest'
import {
  buildPostMetadata,
  countAyatsWithinBudget,
  dhakaDateKey,
  dhakaDayIndex,
  mulberry32,
  pickStartAyat,
  pickSurahNumber,
  seededShuffle,
} from './plan'

describe('dhaka date helpers', () => {
  it('uses UTC+6 for the calendar date', () => {
    expect(dhakaDateKey(new Date('2026-10-12T16:00:00Z'))).toBe('2026-10-12')
    expect(dhakaDateKey(new Date('2026-10-12T18:30:00Z'))).toBe('2026-10-13')
  })

  it('day index advances at Dhaka midnight', () => {
    const before = dhakaDayIndex(new Date('2026-10-12T17:59:59Z'))
    const after = dhakaDayIndex(new Date('2026-10-12T18:00:00Z'))
    expect(after - before).toBe(1)
  })
})

describe('seeded randomness', () => {
  it('mulberry32 is deterministic and in [0, 1)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('seededShuffle is a permutation and does not mutate input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const out = seededShuffle(input, 7)
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...out].sort((x, y) => x - y)).toEqual(input)
  })
})

describe('pickSurahNumber', () => {
  it('covers every surah exactly once per 114-day cycle', () => {
    const start = 20_000 - (20_000 % 114)
    const picks = Array.from({ length: 114 }, (_, i) => pickSurahNumber(start + i))
    expect(new Set(picks).size).toBe(114)
    expect(Math.min(...picks)).toBe(1)
    expect(Math.max(...picks)).toBe(114)
  })

  it('is stable for the same day', () => {
    expect(pickSurahNumber(20_373)).toBe(pickSurahNumber(20_373))
  })
})

describe('pickStartAyat', () => {
  it('starts short surahs at ayat 1', () => {
    expect(pickStartAyat(7, 10, () => 0.99)).toBe(1)
  })

  it('keeps room after the start for long surahs', () => {
    expect(pickStartAyat(286, 10, () => 0)).toBe(1)
    expect(pickStartAyat(286, 10, () => 0.999999)).toBe(284)
  })
})

describe('countAyatsWithinBudget', () => {
  it('stops before exceeding the time budget', () => {
    expect(countAyatsWithinBudget([10_000, 20_000, 30_000, 40_000], 60_000, 10)).toBe(3)
  })

  it('stops at the ayat cap', () => {
    expect(countAyatsWithinBudget([1000, 1000, 1000], 60_000, 2)).toBe(2)
  })

  it('returns 0 when the first ayat is too long', () => {
    expect(countAyatsWithinBudget([120_000], 60_000, 10)).toBe(0)
  })
})

describe('buildPostMetadata', () => {
  const ikhlas = {
    number: 112,
    name: 'Al-Ikhlas',
    englishName: 'Sincerity',
    arabicName: 'الإخلاص',
    numberOfAyahs: 4,
  }

  it('labels a whole surah and adds surah + reciter hashtags', () => {
    const meta = buildPostMetadata({ surah: ikhlas, fromAyat: 1, toAyat: 4, reciterName: 'Mishary Alafasy' })
    expect(meta.title).toBe('Surah Al-Ikhlas (الإخلاص) | Full Surah #Shorts')
    expect(meta.hashtags).toContain('#SurahAlIkhlas')
    expect(meta.hashtags).toContain('#MisharyAlafasy')
    expect(meta.description).toContain('Recited by Mishary Alafasy')
  })

  it('labels a partial range', () => {
    const meta = buildPostMetadata({ surah: ikhlas, fromAyat: 2, toAyat: 3, reciterName: 'X' })
    expect(meta.title).toContain('Ayat 2-3')
  })

  it('dedupes and normalises extra hashtags', () => {
    const meta = buildPostMetadata({
      surah: ikhlas,
      fromAyat: 1,
      toAyat: 1,
      reciterName: 'X',
      extraHashtags: ['quran', '#Quran', 'jariyah now'],
    })
    expect(meta.hashtags.filter((h) => h === '#Quran')).toHaveLength(1)
    expect(meta.hashtags).toContain('#jariyahnow')
    expect(meta.title).toContain('Ayat 1')
  })

  it('keeps the title within 100 characters', () => {
    const meta = buildPostMetadata({
      surah: { ...ikhlas, name: 'A'.repeat(120) },
      fromAyat: 1,
      toAyat: 2,
      reciterName: 'X',
    })
    expect(meta.title.length).toBeLessThanOrEqual(100)
  })
})
