import React from 'react'
import { Easing, interpolate, interpolateColors } from 'remotion'
import { withAlpha } from '@/lib/color'
import { activeScale, restScale, wordBoxScale } from './layout'

export type WordState = 'plain' | 'past' | 'active' | 'future'

const growMs = 750
const shrinkMs = 950

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

const eased = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) } as const

function emphasisFor(state: WordState, msIntoWord: number, msSinceWord: number): number {
  if (state === 'active') return interpolate(msIntoWord, [0, growMs], [0, 1], eased)
  if (state === 'past') return interpolate(msSinceWord, [0, shrinkMs], [1, 0], eased)
  return 0
}

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  visibility: 'visible',
}

export const ArabicWord: React.FC<ArabicWordProps> = ({ word, state, msIntoWord, msSinceWord, appear, fontSize, color, highlightColor }) => {
  const plain = state === 'plain'
  const emphasis = emphasisFor(state, msIntoWord, msSinceWord)
  const scale = plain ? 1 : restScale + (activeScale - restScale) * emphasis
  const restColor = state === 'future' || (state === 'active' && emphasis < 1) ? withAlpha(color, 0.55) : color
  const tint = plain ? color : interpolateColors(emphasis, [0, 1], [restColor, highlightColor])
  const lift = (1 - appear) * fontSize * 0.3

  return (
    <span style={{ display: 'inline-block', position: 'relative', margin: `0 ${fontSize * 0.1}px`, visibility: 'hidden', fontSize: fontSize * (plain ? 1 : wordBoxScale) }}>
      {word}
      <span style={{ ...overlay, fontSize, color: tint, opacity: appear, transform: `translateY(${lift}px) scale(${scale})` }}>{word}</span>
    </span>
  )
}
