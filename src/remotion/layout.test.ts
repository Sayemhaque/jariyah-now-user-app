import { describe, it, expect } from 'vitest'
import { buildSlideSequences, estimateArabicLines, estimateTextLines, fitTextScale } from './layout'

const slide = (audioDurationMs: number) => ({
  arabicText: '',
  translation: '',
  surahName: '',
  surahNameArabic: '',
  ayatNumber: 1,
  surahNumber: 1,
  audioUrl: '',
  audioDurationMs,
})

describe('buildSlideSequences', () => {
  it('places each slide right after the previous one', () => {
    const sequences = buildSlideSequences([slide(1000), slide(2000), slide(500)], 30)
    expect(sequences.map((s) => [s.from, s.durationInFrames])).toEqual([
      [0, 30],
      [30, 60],
      [90, 15],
    ])
  })
})

describe('fitTextScale', () => {
  const base = { arabicSize: 60, translationSize: 26, arabicLineHeight: 1.96, maxWidth: 700, availableHeight: 690 }

  it('keeps short ayat at full size', () => {
    expect(fitTextScale({ ...base, arabicWords: ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ'], translation: 'বলুন, তিনি আল্লাহ, এক' })).toBe(1)
  })

  it('shrinks long ayat until they fit, but never below 45%', () => {
    const words = Array.from({ length: 40 }, () => 'يَشْفَعُ')
    const scale = fitTextScale({ ...base, arabicWords: words, translation: 'ক'.repeat(220) })
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThanOrEqual(0.45)
  })

  it('counts more lines for longer text', () => {
    expect(estimateArabicLines(Array.from({ length: 30 }, () => 'ٱلسَّمَٰوَٰتِ'), 60, 700)).toBeGreaterThan(estimateArabicLines(['قُلْ'], 60, 700))
    expect(estimateTextLines('', 26, 700)).toBe(0)
  })
})
