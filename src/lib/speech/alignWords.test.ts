import { describe, it, expect } from 'vitest'
import { computeWordWindows, spokenLetters } from '@/lib/wordTiming'
import { alignWordsToSpeech } from './alignWords'
import { speechFromSamples } from './speechActivity'
import { synthRecitation, type ToneSpan } from './testAudio'

interface Recited {
  audio: Float32Array
  truth: { startMs: number; endMs: number }[]
}

function recite(words: string[], breaksAfter: Record<number, number>, leadInMs: number, msPerLetter: number, tailMs = 900, jitter = 0): Recited {
  const truth: { startMs: number; endMs: number }[] = []
  const spans: ToneSpan[] = []
  let cursor = leadInMs
  let phraseStart = cursor
  words.forEach((word, i) => {
    const letters = spokenLetters(word)
    const endsPhrase = i in breaksAfter || (i + 1 in breaksAfter && !spokenLetters(words[i + 1]!)) || i === words.length - 1
    const stretch = endsPhrase ? 2 : 0
    const wobble = 1 + jitter * Math.sin(i * 2.7)
    const length = (letters + stretch) * msPerLetter * wobble * (letters ? 1 : 0)
    truth.push({ startMs: cursor, endMs: cursor + length })
    cursor += length
    if (breaksAfter[i] !== undefined || i === words.length - 1) {
      spans.push({ startMs: phraseStart, endMs: cursor })
      cursor += breaksAfter[i] ?? 0
      phraseStart = cursor
    }
  })
  return { audio: synthRecitation(spans, cursor + tailMs), truth }
}

const ayahWithWaqf = 'ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ'.split(' ')
const longAyah =
  'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰٓ أَجَلٍ مُّسَمًّى فَٱكْتُبُوهُ ۚ وَلْيَكْتُب بَّيْنَكُمْ كَاتِبٌۢ بِٱلْعَدْلِ ۚ وَلَا يَأْبَ كَاتِبٌ أَن يَكْتُبَ كَمَا عَلَّمَهُ ٱللَّهُ ۚ فَلْيَكْتُبْ وَلْيُمْلِلِ ٱلَّذِى عَلَيْهِ ٱلْحَقُّ'.split(' ')

const errors = (windows: { startMs: number }[], truth: { startMs: number; endMs: number }[]) =>
  truth.filter((t) => t.endMs > t.startMs).map((t) => Math.abs(windows[truth.indexOf(t)]!.startMs - t.startMs))

describe('alignWordsToSpeech', () => {
  it('starts the first word when the reciter starts, not at a guessed share of the file', () => {
    const { audio, truth } = recite(ayahWithWaqf, { 4: 700, 6: 650 }, 1800, 95)
    const windows = alignWordsToSpeech(ayahWithWaqf, speechFromSamples(audio, 8000)!)
    expect(Math.abs(windows[0]!.startMs - truth[0]!.startMs)).toBeLessThanOrEqual(40)
    expect(Math.max(...errors(windows, truth))).toBeLessThanOrEqual(150)
  })

  it('puts each word after a waqf pause right where the voice resumes', () => {
    const { audio, truth } = recite(ayahWithWaqf, { 4: 700, 6: 650 }, 400, 110)
    const windows = alignWordsToSpeech(ayahWithWaqf, speechFromSamples(audio, 8000)!)
    expect(Math.abs(windows[5]!.startMs - truth[5]!.startMs)).toBeLessThanOrEqual(40)
    expect(Math.abs(windows[7]!.startMs - truth[7]!.startMs)).toBeLessThanOrEqual(40)
  })

  it('beats the old proportional guess by a wide margin on a slow reciter with a long lead-in', () => {
    const { audio, truth } = recite(ayahWithWaqf, { 4: 900, 6: 900 }, 2500, 140, 2000)
    const durationMs = (audio.length / 8000) * 1000
    const aligned = errors(alignWordsToSpeech(ayahWithWaqf, speechFromSamples(audio, 8000)!), truth)
    const guessed = errors(computeWordWindows(ayahWithWaqf, durationMs), truth)
    expect(Math.max(...aligned)).toBeLessThanOrEqual(150)
    expect(Math.max(...guessed)).toBeGreaterThan(1000)
  })

  it('keeps a long ayah in sync across several stops, including a breath without a waqf mark', () => {
    const { audio, truth } = recite(longAyah, { 10: 800, 15: 700, 19: 450, 24: 750 }, 900, 85)
    const windows = alignWordsToSpeech(longAyah, speechFromSamples(audio, 8000)!)
    const phraseStarts = [0, 11, 16, 20, 25]
    phraseStarts.forEach((i) => expect(Math.abs(windows[i]!.startMs - truth[i]!.startMs)).toBeLessThanOrEqual(40))
    expect(Math.max(...errors(windows, truth))).toBeLessThanOrEqual(200)
  })

  it('stays close when the reciter speeds up and slows down from word to word', () => {
    const { audio, truth } = recite(longAyah, { 10: 800, 15: 700, 24: 750 }, 1200, 90, 1100, 0.3)
    const windows = alignWordsToSpeech(longAyah, speechFromSamples(audio, 8000)!)
    ;[0, 11, 16, 25].forEach((i) => expect(Math.abs(windows[i]!.startMs - truth[i]!.startMs)).toBeLessThanOrEqual(40))
    expect(Math.max(...errors(windows, truth))).toBeLessThanOrEqual(350)
  })

  it('returns one ordered window per word and never highlights a lone waqf sign on its own', () => {
    const { audio } = recite(ayahWithWaqf, { 4: 700, 6: 650 }, 500, 100)
    const windows = alignWordsToSpeech(ayahWithWaqf, speechFromSamples(audio, 8000)!)
    expect(windows).toHaveLength(ayahWithWaqf.length)
    windows.forEach((w, i) => {
      expect(w.endMs).toBeGreaterThanOrEqual(w.startMs)
      if (i) expect(w.startMs).toBeGreaterThanOrEqual(windows[i - 1]!.startMs)
    })
    expect(windows[4]!.endMs - windows[4]!.startMs).toBe(0)
    expect(windows[6]!.endMs - windows[6]!.startMs).toBe(0)
  })

  it('keeps the previous word lit through a pause instead of jumping ahead', () => {
    const { audio, truth } = recite(ayahWithWaqf, { 4: 700, 6: 650 }, 500, 100)
    const windows = alignWordsToSpeech(ayahWithWaqf, speechFromSamples(audio, 8000)!)
    expect(windows[3]!.endMs).toBeCloseTo(windows[5]!.startMs, 5)
    expect(windows[5]!.startMs).toBeGreaterThan(truth[3]!.endMs + 500)
  })

  it('handles a single word and an empty list', () => {
    const speech = { startMs: 300, endMs: 1300, pauses: [] }
    expect(alignWordsToSpeech(['ٱلٓمٓ'], speech)).toEqual([{ startMs: 300, endMs: 1300 }])
    expect(alignWordsToSpeech([], speech)).toEqual([])
  })
})
