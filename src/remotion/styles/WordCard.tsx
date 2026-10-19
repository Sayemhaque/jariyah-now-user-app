import React from 'react'
import { Easing, interpolate } from 'remotion'
import type { TimedWord } from '@/lib/types'
import { displayFontStack, uiFontStack } from '../fontStacks'

interface WordCardProps {
  word: TimedWord
  index: number
  total: number
  msInto: number
  unit: number
  fontFamily: string
  accent: string
  caption: string
}

const easeIn = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) } as const

export const WordCard: React.FC<WordCardProps> = ({ word, index, total, msInto, unit, fontFamily, accent, caption }) => {
  const reveal = interpolate(msInto, [0, 420], [0, 1], easeIn)
  const letters = Math.max(1, word.text.replace(/[ً-ٰٟۖ-ۭ]/g, '').length)
  const wordSize = unit * Math.min(230, 1500 / letters)
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: unit * 48, border: `${unit * 1.5}px solid ${accent}55`, background: 'linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.03))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: unit * 18 }}>
      <div style={{ fontFamily: uiFontStack, fontWeight: 600, fontSize: unit * 20, letterSpacing: '0.4em', color: `${accent}cc` }}>
        WORD {index + 1} OF {total} · {caption}
      </div>
      <div style={{ fontFamily, direction: 'rtl', fontSize: wordSize, lineHeight: 1.45, color: '#ffe2a3', opacity: reveal, transform: `scale(${0.9 + 0.1 * reveal})` }}>{word.text}</div>
      {word.transliteration && (
        <div style={{ fontFamily: displayFontStack, fontStyle: 'italic', fontSize: unit * 46, color: 'rgba(255,255,255,.75)', opacity: reveal }}>{word.transliteration}</div>
      )}
      {word.meaning && (
        <div style={{ fontFamily: uiFontStack, fontWeight: 600, fontSize: unit * 60, color: '#fff', textAlign: 'center', padding: `0 ${unit * 40}px`, opacity: reveal }}>{word.meaning}</div>
      )}
    </div>
  )
}
