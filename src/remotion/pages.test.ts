import { describe, it, expect } from 'vitest'
import { pageRanges, planPages, splitByWeights } from './pages'
import { pageState, pageSwitchTimes } from './pageTiming'

const longWords = Array.from({ length: 40 }, () => 'ٱلسَّمَٰوَٰتِ')
const base = { translation: 'one, two; three. four five six seven, eight nine ten', transliteration: '', arabicSize: 90, translationSize: 60, arabicLineHeight: 1.7, maxWidth: 700, availableHeight: 900, arabicWidthFactor: 1 }

describe('pageRanges', () => {
  it('covers every word in order, two lines per page', () => {
    const ranges = pageRanges(longWords, 90, 700)
    expect(ranges[0]!.start).toBe(0)
    expect(ranges[ranges.length - 1]!.end).toBe(longWords.length)
    ranges.slice(1).forEach((r, i) => expect(r.start).toBe(ranges[i]!.end))
  })
})

describe('splitByWeights', () => {
  it('keeps the whole text when there is one page', () => {
    expect(splitByWeights('abc def', [3])).toEqual(['abc def'])
  })

  it('cuts at punctuation near the weighted position and loses no words', () => {
    const parts = splitByWeights(base.translation, [1, 1])
    expect(parts).toHaveLength(2)
    expect(parts.join(' ')).toBe(base.translation)
    expect(parts[0]!.endsWith(';') || parts[0]!.endsWith('.') || parts[0]!.endsWith(',')).toBe(true)
  })

  it('returns empty parts for empty text', () => {
    expect(splitByWeights('', [1, 2, 3])).toEqual(['', '', ''])
  })
})

describe('planPages', () => {
  it('keeps a short ayah on one page', () => {
    const plan = planPages({ ...base, words: ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ'], translation: 'Say, He is Allah, One' })
    expect(plan.pages).toHaveLength(1)
  })

  it('splits a long ayah into pages that keep text large', () => {
    const plan = planPages({ ...base, words: longWords })
    expect(plan.pages.length).toBeGreaterThan(1)
    expect(plan.scale).toBeGreaterThan(0.6)
  })
})

describe('pageState', () => {
  const words = Array.from({ length: 4 }, (_, i) => ({ startMs: i * 1000, endMs: i * 1000 + 1000 }))
  const switches = pageSwitchTimes(words, [{ start: 0, end: 2 }, { start: 2, end: 4 }])

  it('shows the first page until just before the next page is recited', () => {
    expect(pageState(switches, 500)).toMatchObject({ index: 0, opacity: 1 })
    expect(pageState(switches, 2500).index).toBe(1)
  })

  it('fades out before switching and fades in after', () => {
    expect(pageState(switches, switches[1]! - 100).opacity).toBeLessThan(1)
    expect(pageState(switches, switches[1]! + 100).opacity).toBeLessThan(1)
    expect(pageState(switches, switches[1]! + 1000).opacity).toBe(1)
  })
})
