import React from 'react'
import { uiFontStack } from './fontStacks'

interface TranslationTextProps {
  text: string
  fontSize: number
  maxWidth: number
  fontFamily?: string
  spacing: number
  color: string
}

export const TranslationText: React.FC<TranslationTextProps> = ({ text, fontSize, maxWidth, fontFamily, spacing, color }) => {
  if (!text) return null
  return (
    <p
      style={{
        textAlign: 'center',
        maxWidth,
        fontSize,
        fontWeight: 500,
        color,
        lineHeight: 1.45,
        letterSpacing: '0.01em',
        marginTop: `${spacing * 100}%`,
        fontFamily: fontFamily ?? uiFontStack,
      }}
    >
      {text}
    </p>
  )
}
