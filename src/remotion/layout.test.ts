import { describe, it, expect } from 'vitest'
import { buildSlideSequences } from './layout'

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
