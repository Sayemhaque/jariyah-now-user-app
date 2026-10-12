import React from 'react'
import { Easing, interpolate, interpolateColors } from 'remotion'
import { withAlpha } from '@/lib/color'
import { activeScale } from './layout'

export type WordState = 'plain' | 'past' | 'active' | 'future'

const restScale = 0.84
const growMs = 450
const shrinkMs = 520

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

const eased = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) } as const

function emphasisFor(state: WordState, msIntoWord: number, msSinceWord: number): number {
  if (state === 'active') return interpolate(msIntoWord, [0, growMs], [0, 1], eased)
  if (state === 'past') return interpolate(msSinceWord, [0, shrinkMs], [1, 0], eased)
  return 0
}

export const ArabicWord: React.FC<ArabicWordProps> = ({ word, state, msIntoWord, msSinceWord, appear, fontSize, color, highlightColor }) => {
  const plain = state === 'plain'
  const emphasis = emphasisFor(state, msIntoWord, msSinceWord)
  const scale = plain ? 1 : restScale + (activeScale - restScale) * emphasis
  const restColor = state === 'future' || (state === 'active' && emphasis < 1) ? withAlpha(color, 0.5) : color
  const tint = plain ? color : interpolateColors(emphasis, [0, 1], [restColor, highlightColor])

  return (
    <span
      style={{
        display: 'inline-block',
        margin: `0 ${fontSize * 0.1}px`,
        fontSize: fontSize * scale,
        color: tint,
        opacity: appear,
        transform: `translateY(${(1 - appear) * fontSize * 0.3}px)`,
        textShadow:
          emphasis <= 0.01
            ? '0 2px 10px rgba(0,0,0,0.55)'
            : `0 0 ${fontSize * 0.45 * emphasis}px ${withAlpha(highlightColor, 0.7 * emphasis)}, 0 2px 10px rgba(0,0,0,0.55)`,
      }}
    >
      {word}
    </span>
  )
}
