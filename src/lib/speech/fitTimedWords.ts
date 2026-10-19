import type { TimedWord } from '@/lib/types'
import type { SpeechMap } from './speechActivity'

const overrunToleranceMs = 300
const startToleranceMs = 1200
const endToleranceMs = 1800
const minCoverage = 0.6

function shift(words: TimedWord[], offsetMs: number): TimedWord[] {
  return words.map((w) => ({ ...w, startMs: w.startMs - offsetMs, endMs: w.endMs - offsetMs }))
}

function isOrdered(words: TimedWord[]): boolean {
  return words.every((w, i) => w.endMs > w.startMs && (i === 0 || w.startMs >= words[i - 1]!.startMs))
}

function removeOffset(words: TimedWord[], durationMs: number, speech: SpeechMap | null): TimedWord[] {
  const lastEnd = words[words.length - 1]!.endMs
  if (lastEnd <= durationMs + overrunToleranceMs) return words
  return shift(words, words[0]!.startMs - (speech?.startMs ?? 0))
}

function matchesSpeech(words: TimedWord[], speech: SpeechMap): boolean {
  const first = words[0]!.startMs
  const last = words[words.length - 1]!.endMs
  const spoken = speech.endMs - speech.startMs
  const overlap = Math.min(last, speech.endMs) - Math.max(first, speech.startMs)
  return (
    Math.abs(first - speech.startMs) <= startToleranceMs &&
    Math.abs(last - speech.endMs) <= endToleranceMs &&
    overlap >= spoken * minCoverage
  )
}

export function fitTimedWords(words: TimedWord[] | undefined, durationMs: number, speech: SpeechMap | null): TimedWord[] | null {
  if (!words?.length || !isOrdered(words)) return null
  const fitted = removeOffset(words, durationMs, speech)
  if (fitted[0]!.startMs < -overrunToleranceMs || fitted[fitted.length - 1]!.endMs > durationMs + overrunToleranceMs) return null
  if (speech && !matchesSpeech(fitted, speech)) return null
  return fitted.map((w) => ({ ...w, startMs: Math.max(0, w.startMs), endMs: Math.min(durationMs, Math.max(w.endMs, 1)) }))
}
