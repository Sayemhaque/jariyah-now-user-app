import type { TimedWord } from '@/lib/types'
import { activeWordIndex } from '@/lib/wordTiming'

export function currentWord(words: TimedWord[], timeMs: number) {
  if (!words.length) return null
  const index = Math.min(words.length - 1, Math.max(0, activeWordIndex(words, timeMs)))
  return { index, word: words[index]!, msInto: Math.max(0, timeMs - words[index]!.startMs) }
}
