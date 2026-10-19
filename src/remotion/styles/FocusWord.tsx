import React from 'react'
import type { TimedWord } from '@/lib/types'

interface FocusWordProps {
  word: TimedWord | undefined
  fontFamily: string
  size: number
  focus: number
  top: number
  opacity: number
}

const letterCount = (text: string) => Math.max(1, text.replace(/[ً-ٰٟۖ-ۭ]/g, '').length)

export const fitWordSize = (text: string, maxSize: number, maxWidth: number) => Math.min(maxSize, maxWidth / (letterCount(text) * 0.52 + 0.6))

export const FocusWord: React.FC<FocusWordProps> = ({ word, fontFamily, size, focus, top, opacity }) =>
  word ? (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        textAlign: 'center',
        direction: 'rtl',
        fontFamily,
        fontSize: size,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        color: focus > 0.5 ? '#fff3da' : '#ffffff',
        opacity,
        filter: `blur(${(1 - focus) * size * 0.06}px)`,
        transform: `translateY(-50%) scale(${0.82 + 0.18 * focus})`,
      }}
    >
      {word.text}
    </div>
  ) : null
