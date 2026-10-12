import React from 'react'
import { interpolate } from 'remotion'
import { activeWordIndex, computeWordWindows, splitWords } from '@/lib/wordTiming'
import { ArabicWord, type WordState } from './ArabicWord'
import { AyahMedallion } from './AyahMedallion'

interface ArabicTextProps {
  text: string
  fontSize: number
  fontFace: string
  color: string
  highlightColor: string
  highlight: boolean
  ayatNumber: number
  audioDurationMs: number
  timeMs: number
  frame: number
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

export const ArabicText: React.FC<ArabicTextProps> = ({ text, fontSize, fontFace, color, highlightColor, highlight, ...timing }) => {
  const words = React.useMemo(() => splitWords(text), [text])
  const windows = React.useMemo(() => computeWordWindows(words, timing.audioDurationMs), [words, timing.audioDurationMs])
  if (!words.length) return null

  const active = highlight ? activeWordIndex(windows, timing.timeMs) : -1
  const stateOf = (index: number): WordState =>
    !highlight ? 'plain' : index < active ? 'past' : index === active ? 'active' : 'future'
  const progressOf = (index: number) => {
    const window = windows[index]
    return window ? (timing.timeMs - window.startMs) / Math.max(1, window.endMs - window.startMs) : 0
  }

  return (
    <div
      style={{
        direction: 'rtl',
        textAlign: 'center',
        width: '100%',
        lineHeight: 1.85,
        fontSize,
        fontFamily: fontFace.startsWith('font-') ? fontFace.replace('font-', '') : fontFace,
      }}
      lang="ar"
    >
      {words.map((word, index) => (
        <ArabicWord
          key={index}
          word={word}
          state={stateOf(index)}
          activeProgress={progressOf(index)}
          appear={interpolate(timing.frame, [index * 1.5, index * 1.5 + 9], [0, 1], clamp)}
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
        opacity={interpolate(timing.frame, [words.length * 1.5, words.length * 1.5 + 9], [0, 1], clamp)}
      />
    </div>
  )
}
