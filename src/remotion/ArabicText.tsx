import React from 'react'

function buildArabicTokens(text: string): string[] {
  if (!text) return []
  return text.split(/\s+/).filter(Boolean)
}

export const ArabicText: React.FC<{
  text: string
  fontSize: number
  fontFace: string
  color: string
}> = ({ text, fontSize, fontFace, color }) => {
  if (!text) return null

  const fontFamily = fontFace.startsWith('font-') ? fontFace.replace('font-', '') : fontFace

  return (
    <div
      style={{
        direction: 'rtl',
        textAlign: 'center',
        width: '100%',
        lineHeight: 1.75,
        color,
        fontSize,
        textShadow: '0 1px 4px rgba(0,0,0,0.7)',
      }}
      lang="ar"
    >
      {buildArabicTokens(text).map((tok, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            margin: '0 1px',
            color,
          }}
        >
          {tok}
        </span>
      ))}
    </div>
  )
}
