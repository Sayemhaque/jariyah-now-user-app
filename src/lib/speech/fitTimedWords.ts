import type { TimedWord } from '@/lib/types'
import type { SpeechMap } from './speechActivity'

const overrunToleranceMs = 300
const snapToleranceMs = 1500
const trustedOffsetMs = 150
const endToleranceMs = 600

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

function snapToSpeech(words: TimedWord[], speech: SpeechMap): TimedWord[] | null {
  const offset = words[0]!.startMs - speech.startMs
  if (Math.abs(offset) > snapToleranceMs) return null
  const snapped = Math.abs(offset) <= trustedOffsetMs ? words : shift(words, offset)
  return Math.abs(snapped[snapped.length - 1]!.endMs - speech.endMs) <= endToleranceMs ? snapped : null
}

export function fitTimedWords(words: TimedWord[] | undefined, durationMs: number, speech: SpeechMap | null): TimedWord[] | null {
  if (!words?.length || !isOrdered(words)) return null
  const fitted = removeOffset(words, durationMs, speech)
  if (fitted[0]!.startMs < -overrunToleranceMs || fitted[fitted.length - 1]!.endMs > durationMs + overrunToleranceMs) return null
  const matched = speech ? snapToSpeech(fitted, speech) : fitted
  if (!matched) return null
  return matched.map((w) => ({ ...w, startMs: Math.max(0, w.startMs), endMs: Math.min(durationMs, Math.max(w.endMs, 1)) }))
}
