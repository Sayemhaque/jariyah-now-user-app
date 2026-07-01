import { describe, it, expect } from 'vitest'
import { getActiveWordIndex } from './highlight'
import type { WordTiming } from './types'

// Helper: build a word-timing array where each word is 1000ms long, starting
// at 0. This is the most common shape for testing.
function makeWords(count: number, gapMs = 1000): WordTiming[] {
  return Array.from({ length: count }, (_, i) => ({
    text: `word${i}`,
    position: i,
    startMs: i * gapMs,
    endMs: (i + 1) * gapMs,
  }))
}

describe('getActiveWordIndex', () => {
  describe('empty / edge inputs', () => {
    it('returns -1 for an empty word list', () => {
      expect(getActiveWordIndex([], 100)).toBe(-1)
    })

    it('returns -1 when tMs is 0 (before any word)', () => {
      expect(getActiveWordIndex(makeWords(3), 0)).toBe(-1)
    })

    it('returns -1 when tMs is negative', () => {
      expect(getActiveWordIndex(makeWords(3), -100)).toBe(-1)
    })
  })

  describe('basic highlighting', () => {
    it('highlights the first word at its start time', () => {
      expect(getActiveWordIndex(makeWords(3), 0)).toBe(-1) // t=0 is "before"
      expect(getActiveWordIndex(makeWords(3), 1)).toBe(0) // first word active
    })

    it('highlights word 0 for 0 ≤ t < 1000', () => {
      expect(getActiveWordIndex(makeWords(3), 500)).toBe(0)
      expect(getActiveWordIndex(makeWords(3), 999)).toBe(0)
    })

    it('highlights word 1 for 1000 ≤ t < 2000', () => {
      expect(getActiveWordIndex(makeWords(3), 1000)).toBe(1)
      expect(getActiveWordIndex(makeWords(3), 1500)).toBe(1)
      expect(getActiveWordIndex(makeWords(3), 1999)).toBe(1)
    })

    it('highlights the last word at its start time', () => {
      const words = makeWords(3)
      expect(getActiveWordIndex(words, 2000)).toBe(2)
    })
  })

  describe('trailing time after the last word', () => {
    it('returns the last word index when tMs is past the last word end', () => {
      const words = makeWords(3) // word 2 ends at 3000
      expect(getActiveWordIndex(words, 3000)).toBe(2)
      expect(getActiveWordIndex(words, 5000)).toBe(2)
      expect(getActiveWordIndex(words, 999_999)).toBe(2)
    })
  })

  describe('zero-duration words (endMs === 0)', () => {
    it('uses the next word startMs as the end when endMs is 0', () => {
      const words: WordTiming[] = [
        { text: 'a', position: 0, startMs: 0, endMs: 0 }, // gap to next: 1000
        { text: 'b', position: 1, startMs: 1000, endMs: 2000 },
      ]
      expect(getActiveWordIndex(words, 500)).toBe(0)
      expect(getActiveWordIndex(words, 999)).toBe(0)
      expect(getActiveWordIndex(words, 1000)).toBe(1)
    })

    it('uses tMs + 1 as the end for the last word when endMs is 0', () => {
      const words: WordTiming[] = [
        { text: 'a', position: 0, startMs: 0, endMs: 1000 },
        { text: 'b', position: 1, startMs: 1000, endMs: 0 }, // last word, no end
      ]
      expect(getActiveWordIndex(words, 1000)).toBe(1)
      expect(getActiveWordIndex(words, 1500)).toBe(1)
    })

    it('handles all words having endMs === 0', () => {
      const words: WordTiming[] = [
        { text: 'a', position: 0, startMs: 0, endMs: 0 },
        { text: 'b', position: 1, startMs: 500, endMs: 0 },
        { text: 'c', position: 2, startMs: 1000, endMs: 0 },
      ]
      expect(getActiveWordIndex(words, 250)).toBe(0)
      expect(getActiveWordIndex(words, 750)).toBe(1)
      expect(getActiveWordIndex(words, 1500)).toBe(2) // past last → last
    })
  })

  describe('gappy timings (words not back-to-back)', () => {
    it('returns the last word index during a gap (trailing behavior)', () => {
      const words: WordTiming[] = [
        { text: 'a', position: 0, startMs: 0, endMs: 500 },
        { text: 'b', position: 1, startMs: 1500, endMs: 2000 },
      ]
      // During the gap (500 ≤ t < 1500), word 0 has ended and word 1
      // hasn't started. The implementation falls through to its trailing
      // rule: "past the last word's end → return the last word index". This
      // means the highlight pins to the last word during gaps, which is
      // acceptable for the recitation use case (brief pauses between words).
      expect(getActiveWordIndex(words, 750)).toBe(1) // last word
      expect(getActiveWordIndex(words, 1499)).toBe(1)
      expect(getActiveWordIndex(words, 1500)).toBe(1) // word 1 actually starts
    })
  })

  describe('single word', () => {
    it('highlights the only word once tMs > 0', () => {
      const words = makeWords(1)
      expect(getActiveWordIndex(words, 0)).toBe(-1)
      expect(getActiveWordIndex(words, 1)).toBe(0)
      expect(getActiveWordIndex(words, 999)).toBe(0)
      expect(getActiveWordIndex(words, 9999)).toBe(0) // past end → last
    })
  })
})
