import { describe, it, expect } from 'vitest'
import type { TimedWord } from '@/lib/types'
import { fitTimedWords } from './fitTimedWords'
import { syncWords } from './syncWords'

const ikhlas = ['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ']
const timed = (starts: number[], end: number): TimedWord[] =>
  starts.map((startMs, i) => ({ text: ikhlas[i]!, startMs, endMs: starts[i + 1] ?? end }))
const speech = { startMs: 420, endMs: 3300, pauses: [] }

describe('fitTimedWords', () => {
  it('keeps timings that already match the recitation', () => {
    const words = timed([430, 900, 1500, 2300], 3280)
    expect(fitTimedWords(words, 3900, speech)).toEqual(words)
  })

  it('moves chapter-wide timestamps back onto the verse file', () => {
    const words = timed([61_430, 61_900, 62_500, 63_300], 64_280)
    const fitted = fitTimedWords(words, 3900, speech)!
    expect(fitted.map((w) => w.startMs)).toEqual([420, 890, 1490, 2290])
    expect(fitted[3]!.endMs).toBe(3270)
  })

  it('rejects timings made for a different recording', () => {
    expect(fitTimedWords(timed([2400, 2800, 3200, 3600], 3890), 3900, speech)).toBeNull()
    expect(fitTimedWords(timed([100, 300, 500, 700], 1200), 3900, speech)).toBeNull()
  })

  it('rejects out-of-order or empty timings', () => {
    expect(fitTimedWords(timed([900, 430, 1500, 2300], 3280), 3900, speech)).toBeNull()
    expect(fitTimedWords([], 3900, speech)).toBeNull()
    expect(fitTimedWords(undefined, 3900, speech)).toBeNull()
  })

  it('still trims timings when the audio could not be analysed', () => {
    expect(fitTimedWords(timed([430, 900, 1500, 2300], 3950), 3900, null)![3]!.endMs).toBe(3900)
  })
})

describe('syncWords', () => {
  const arabicText = ikhlas.join(' ')

  it('uses quran.com timings when they fit the audio', () => {
    const words = timed([430, 900, 1500, 2300], 3280)
    expect(syncWords({ arabicText, timedWords: words, durationMs: 3900, speech })).toEqual(words)
  })

  it('aligns to the audio for a reciter without quran.com timings', () => {
    const words = syncWords({ arabicText, durationMs: 3900, speech })!
    expect(words.map((w) => w.text)).toEqual(ikhlas)
    expect(words[0]!.startMs).toBe(420)
    expect(words[3]!.endMs).toBe(3300)
  })

  it('re-aligns the quran.com words when their timings do not fit', () => {
    const words = syncWords({ arabicText: 'other text', timedWords: timed([2400, 2800, 3200, 3600], 3890), durationMs: 3900, speech })!
    expect(words.map((w) => w.text)).toEqual(ikhlas)
    expect(words[0]!.startMs).toBe(420)
  })

  it('falls back to the plain proportional timing when nothing is known', () => {
    expect(syncWords({ arabicText, durationMs: 3900, speech: null })).toBeUndefined()
    expect(syncWords({ arabicText, durationMs: 0, speech })).toBeUndefined()
  })
})
