import React from 'react'
import { toArabicDigits } from '@/lib/wordTiming'

interface AyahMedallionProps {
  number: number
  fontSize: number
  color: string
  highlightColor: string
  opacity: number
}

export const AyahMedallion: React.FC<AyahMedallionProps> = ({ number, fontSize, color, highlightColor, opacity }) => {
  const size = fontSize * 0.95
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        width: size,
        height: size,
        margin: `0 ${fontSize * 0.15}px`,
        borderRadius: '50%',
        border: `${Math.max(1.5, fontSize * 0.05)}px solid ${highlightColor}`,
        boxShadow: `0 0 ${fontSize * 0.3}px ${highlightColor}66, inset 0 0 ${fontSize * 0.2}px ${highlightColor}44`,
        color,
        fontSize: fontSize * 0.42,
        lineHeight: 1,
        opacity,
      }}
    >
      {toArabicDigits(number)}
    </span>
  )
}
