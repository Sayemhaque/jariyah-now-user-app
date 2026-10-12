import { describe, it, expect } from 'vitest'
import { activeWordIndex, computeWordWindows, splitWords, toArabicDigits, wordWeight } from './wordTiming'

describe('wordWeight', () => {
  it('ignores harakat so vowel marks do not stretch a word', () => {
    expect(wordWeight('قُلْ')).toBe(wordWeight('قل'))
    expect(wordWeight('ٱللَّهُ')).toBe(4)
  })
})

describe('computeWordWindows', () => {
  it('spreads words across the audio with a short lead-in and tail', () => {
    const windows = computeWordWindows(['ab', 'abcd', 'ab'], 1000)
    expect(windows[0]!.startMs).toBeCloseTo(40)
    expect(windows.at(-1)!.endMs).toBeCloseTo(940)
    expect(windows[1]!.endMs - windows[1]!.startMs).toBeCloseTo(2 * (windows[0]!.endMs - windows[0]!.startMs))
  })

  it('returns nothing without words or audio', () => {
    expect(computeWordWindows([], 1000)).toEqual([])
    expect(computeWordWindows(['a'], 0)).toEqual([])
  })
})

describe('activeWordIndex', () => {
  const windows = computeWordWindows(splitWords('a b c d'), 1000)

  it('is -1 before the first word and past the end after the last', () => {
    expect(activeWordIndex(windows, 0)).toBe(-1)
    expect(activeWordIndex(windows, 999)).toBe(4)
  })

  it('finds the word being recited', () => {
    expect(activeWordIndex(windows, 300)).toBe(1)
  })
})

describe('toArabicDigits', () => {
  it('converts western digits', () => {
    expect(toArabicDigits(255)).toBe('٢٥٥')
  })
})
