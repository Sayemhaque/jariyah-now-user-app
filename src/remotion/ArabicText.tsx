import React from 'react'
import { interpolate } from 'remotion'
import type { TimedWord } from '@/lib/types'
import { activeWordIndex, computeWordWindows, splitWords } from '@/lib/wordTiming'
import { ArabicWord, type WordState } from './ArabicWord'
import { AyahMedallion } from './AyahMedallion'

interface ArabicTextProps {
  text: string
  timedWords?: TimedWord[]
  fontSize: number
  fontFamily: string
  color: string
  highlightColor: string
  highlight: boolean
  ayatNumber: number
  audioDurationMs: number
  timeMs: number
  frame: number
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const appearAt = (frame: number, index: number) => interpolate(frame, [index * 1.2, index * 1.2 + 10], [0, 1], clamp)

export const ArabicText: React.FC<ArabicTextProps> = ({ text, timedWords, fontSize, fontFamily, color, highlightColor, highlight, ...timing }) => {
  const words = React.useMemo(
    () => timedWords?.length ? timedWords : (() => {
      const plain = splitWords(text)
      const windows = computeWordWindows(plain, timing.audioDurationMs)
      return plain.map((word, index) => ({ text: word, ...windows[index]! }))
    })(),
    [timedWords, text, timing.audioDurationMs],
  )
  if (!words.length) return null

  const active = highlight ? activeWordIndex(words, timing.timeMs) : -1
  const stateOf = (index: number): WordState =>
    !highlight ? 'plain' : index < active ? 'past' : index === active ? 'active' : 'future'

  return (
    <div style={{ direction: 'rtl', textAlign: 'center', width: '100%', lineHeight: 2.05, fontSize, fontFamily }} lang="ar">
      {words.map((word, index) => (
        <ArabicWord
          key={index}
          word={word.text}
          state={stateOf(index)}
          msIntoWord={timing.timeMs - (word.startMs ?? 0)}
          msSinceWord={timing.timeMs - (word.endMs ?? 0)}
          appear={appearAt(timing.frame, index)}
          fontSize={fontSize}
          color={color}
          highlightColor={highlightColor}
        />
      ))}
      <AyahMedallion
        number={timing.ayatNumber}
        fontSize={fontSize}
        color={color}
        highlightColor={highlightColor}
        opacity={appearAt(timing.frame, words.length)}
      />
    </div>
  )
}
