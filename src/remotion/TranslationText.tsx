import React from 'react'
import { uiFontStack } from './fontStacks'

interface TranslationTextProps {
  text: string
  fontSize: number
  maxWidth: number
  fontFamily?: string
  spacing: number
}

export const TranslationText: React.FC<TranslationTextProps> = ({ text, fontSize, maxWidth, fontFamily, spacing }) => {
  if (!text) return null
  return (
    <p
      style={{
        textAlign: 'center',
        maxWidth,
        fontSize,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 1.45,
        letterSpacing: '0.01em',
        marginTop: `${spacing * 100}%`,
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        fontFamily: fontFamily ?? uiFontStack,
      }}
    >
      {text}
    </p>
  )
}
