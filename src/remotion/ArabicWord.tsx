import React from 'react'
import { interpolate } from 'remotion'

export type WordState = 'plain' | 'past' | 'active' | 'future'

interface ArabicWordProps {
  word: string
  state: WordState
  activeProgress: number
  appear: number
  fontSize: number
  color: string
  highlightColor: string
}

const baseShadow = '0 2px 6px rgba(0,0,0,0.65)'

export const ArabicWord: React.FC<ArabicWordProps> = ({ word, state, activeProgress, appear, fontSize, color, highlightColor }) => {
  const active = state === 'active'
  const scale = active ? interpolate(activeProgress, [0, 0.25, 1], [1, 1.1, 1.06], { extrapolateRight: 'clamp' }) : 1
  const dim = state === 'future' ? 0.42 : 1

  return (
    <span
      style={{
        display: 'inline-block',
        margin: `0 ${fontSize * 0.11}px`,
        color: active ? highlightColor : color,
        opacity: dim * appear,
        transform: `translateY(${(1 - appear) * fontSize * 0.3}px) scale(${scale})`,
        textShadow: active ? `0 0 ${fontSize * 0.45}px ${highlightColor}, ${baseShadow}` : baseShadow,
      }}
    >
      {word}
    </span>
  )
}
