import React from 'react'
import { interpolate } from 'remotion'
import { withAlpha } from '@/lib/color'

export type WordState = 'plain' | 'past' | 'active' | 'future'

export const activeScale = 1.4
const restScale = 0.84
const growMs = 160

interface ArabicWordProps {
  word: string
  state: WordState
  msIntoWord: number
  msSinceWord: number
  appear: number
  fontSize: number
  color: string
  highlightColor: string
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function scaleFor(state: WordState, msIntoWord: number, msSinceWord: number): number {
  if (state === 'plain') return 1
  if (state === 'active') return interpolate(msIntoWord, [0, growMs], [restScale, activeScale], clamp)
  if (state === 'past') return interpolate(msSinceWord, [0, growMs], [activeScale, restScale], clamp)
  return restScale
}

export const ArabicWord: React.FC<ArabicWordProps> = ({ word, state, msIntoWord, msSinceWord, appear, fontSize, color, highlightColor }) => {
  const scale = scaleFor(state, msIntoWord, msSinceWord)
  const emphasis = (scale - restScale) / (activeScale - restScale)
  const active = state === 'active'

  return (
    <span
      style={{
        display: 'inline-block',
        margin: `0 ${fontSize * 0.1}px`,
        fontSize: fontSize * scale,
        color: active ? highlightColor : state === 'future' ? withAlpha(color, 0.5) : color,
        opacity: appear,
        transform: `translateY(${(1 - appear) * fontSize * 0.3}px)`,
        textShadow:
          state === 'plain' || emphasis <= 0
            ? '0 2px 10px rgba(0,0,0,0.55)'
            : `0 0 ${fontSize * 0.45 * emphasis}px ${withAlpha(highlightColor, 0.75)}, 0 2px 10px rgba(0,0,0,0.55)`,
      }}
    >
      {word}
    </span>
  )
}
