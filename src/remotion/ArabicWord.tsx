import React from 'react'
import { interpolate } from 'remotion'

export type WordState = 'plain' | 'past' | 'active' | 'future'

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
const depthShadow = '0 2px 10px rgba(0,0,0,0.55)'

export const ArabicWord: React.FC<ArabicWordProps> = ({ word, state, msIntoWord, msSinceWord, appear, fontSize, color, highlightColor }) => {
  const active = state === 'active'
  const glow = active ? interpolate(msIntoWord, [0, 50], [0, 1], clamp) : state === 'past' ? interpolate(msSinceWord, [0, 320], [0.55, 0], clamp) : 0
  const lift = active ? interpolate(msIntoWord, [0, 90], [0, 1], clamp) : 0
  const opacity = state === 'future' ? 0.5 : 1

  return (
    <span
      style={{
        display: 'inline-block',
        margin: `0 ${fontSize * 0.12}px`,
        color: active ? highlightColor : color,
        opacity: opacity * appear,
        transform: `translateY(${(1 - appear) * fontSize * 0.25 - lift * fontSize * 0.04}px) scale(${1 + lift * 0.04})`,
        textShadow: glow > 0 ? `0 0 ${fontSize * 0.5 * glow}px ${highlightColor}, ${depthShadow}` : depthShadow,
      }}
    >
      {word}
    </span>
  )
}
