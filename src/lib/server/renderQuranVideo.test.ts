import { describe, expect, it } from 'vitest'

import { buildFinalOverlayFilter } from './renderQuranVideo'
import { visibleArabicChars } from './overlay'

describe('buildFinalOverlayFilter', () => {
  it('builds one timed overlay step per slide', () => {
    const filter = buildFinalOverlayFilter([
      { audioDurationMs: 1000 } as any,
      { audioDurationMs: 2500 } as any,
    ])

    expect(filter).toContain("[0:v][2:v]overlay=0:0:enable='between(t,0.000,1.000)'[v1]")
    expect(filter).toContain("[v1][3:v]overlay=0:0:enable='between(t,1.000,3.500)'[vout]")
  })
})

describe('visibleArabicChars', () => {
  it('removes Arabic diacritics (fatha, kasra, damma, sukun, etc)', () => {
    // يَسْأَلُونَ  = ي + short vowel fatha + س + sukun + أ + fatha + ل + damma + و + ن + fatha
    // 11 codepoints, 6 visible glyphs
    const withDiacritics = '\u064A\u064E\u0633\u0652\u0623\u064E\u0644\u064F\u0648\u0646\u064E'
    const result = visibleArabicChars(withDiacritics)
    expect(result).toBe('\u064A\u0633\u0623\u0644\u0648\u0646')
    expect(result.length).toBe(6)
  })

  it('does not affect Latin text', () => {
    expect(visibleArabicChars('Hello world')).toBe('Hello world')
  })

  it('does not modify plain Arabic text without diacritics', () => {
    const plain = '\u0627\u0644\u0633\u0644\u0627\u0645' // السلام
    expect(visibleArabicChars(plain)).toBe(plain)
  })
})
