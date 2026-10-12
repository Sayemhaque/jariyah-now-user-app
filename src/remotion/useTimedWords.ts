import React from 'react'
import type { TimedWord } from '@/lib/types'
import { computeWordWindows, splitWords } from '@/lib/wordTiming'

export function useTimedWords(text: string, timedWords: TimedWord[] | undefined, audioDurationMs: number): TimedWord[] {
  return React.useMemo(() => {
    if (timedWords?.length) return timedWords
    const plain = splitWords(text)
    const windows = computeWordWindows(plain, audioDurationMs)
    return plain.map((word, index) => ({ text: word, ...windows[index]! }))
  }, [timedWords, text, audioDurationMs])
}
