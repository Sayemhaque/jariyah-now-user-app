import type { TimedWord } from '@/lib/types'
import { splitWords } from '@/lib/wordTiming'
import type { SpeechMap } from './speechActivity'
import { alignWordsToSpeech } from './alignWords'
import { fitTimedWords } from './fitTimedWords'

export interface WordSyncInput {
  arabicText: string
  timedWords?: TimedWord[]
  durationMs: number
  speech: SpeechMap | null
}

export function syncWords({ arabicText, timedWords, durationMs, speech }: WordSyncInput): TimedWord[] | undefined {
  if (durationMs <= 0) return undefined
  const fitted = fitTimedWords(timedWords, durationMs, speech)
  if (fitted) return fitted
  if (!speech) return undefined
  const texts = timedWords?.length ? timedWords.map((w) => w.text) : splitWords(arabicText)
  const windows = alignWordsToSpeech(texts, speech)
  return texts.map((text, i) => ({ ...(timedWords?.[i] ?? {}), text, ...windows[i]! }))
}
