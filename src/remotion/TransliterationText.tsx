import React from 'react'
import { uiFontStack } from './fontStacks'

interface TransliterationTextProps {
  text: string
  fontSize: number
  maxWidth: number
}

export const TransliterationText: React.FC<TransliterationTextProps> = ({ text, fontSize, maxWidth }) => {
  if (!text) return null
  return (
    <div
      style={{
        textAlign: 'center',
        maxWidth,
        fontSize,
        fontFamily: uiFontStack,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
        letterSpacing: '0.02em',
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  )
}
