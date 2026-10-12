import React from 'react'
import { interpolate } from 'remotion'
import type { TimedWord } from '@/lib/types'
import { activeWordIndex } from '@/lib/wordTiming'
import { ArabicWord, type WordState } from './ArabicWord'
import { arabicLineFactor } from './layout'
import { AyahMedallion } from './AyahMedallion'

interface ArabicTextProps {
  words: TimedWord[]
  start: number
  end: number
  showNumber: boolean
  fontSize: number
  fontFamily: string
  color: string
  highlightColor: string
  highlight: boolean
  ayatNumber: number
  timeMs: number
  frame: number
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const appearAt = (frame: number, index: number) => interpolate(frame, [index * 2.5, index * 2.5 + 18], [0, 1], clamp)

export const ArabicText: React.FC<ArabicTextProps> = ({ words, start, end, showNumber, fontSize, fontFamily, color, highlightColor, highlight, ...timing }) => {
  if (!words.length) return null

  const active = highlight ? activeWordIndex(words, timing.timeMs) : -1
  const stateOf = (index: number): WordState =>
    !highlight ? 'plain' : index < active ? 'past' : index === active ? 'active' : 'future'

  return (
    <div
      style={{ direction: 'rtl', textAlign: 'center', width: '100%', lineHeight: `${fontSize * (highlight ? arabicLineFactor : 1.5)}px`, fontSize, fontFamily }}
      lang="ar"
    >
      {words.slice(start, end).map((word, offset) => (
        <ArabicWord
          key={start + offset}
          word={word.text}
          state={stateOf(start + offset)}
          msIntoWord={timing.timeMs - word.startMs}
          msSinceWord={timing.timeMs - word.endMs}
          appear={appearAt(timing.frame, offset)}
          fontSize={fontSize}
          color={color}
          highlightColor={highlightColor}
        />
      ))}
      {showNumber && (
        <AyahMedallion
          number={timing.ayatNumber}
          fontSize={fontSize}
          color={color}
          highlightColor={highlightColor}
          opacity={appearAt(timing.frame, end - start)}
        />
      )}
    </div>
  )
}
