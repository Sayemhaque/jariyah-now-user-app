import React from 'react'

export const TranslationText: React.FC<{
  text: string
  fontSize: number
  maxWidth: number
  isBengali: boolean
  bengaliFont: string
  spacing: number
}> = ({ text, fontSize, maxWidth, isBengali, bengaliFont, spacing }) => {
  if (!text) return null

  const fontFamily = isBengali
    ? bengaliFont.replace('font-bengali-', '')
    : undefined

  return (
    <p
      style={{
        textAlign: 'center',
        maxWidth,
        fontSize,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 1.3,
        marginTop: `${spacing * 100}%`,
        ...(fontFamily ? { fontFamily } : {}),
      }}
    >
      {text}
    </p>
  )
}
