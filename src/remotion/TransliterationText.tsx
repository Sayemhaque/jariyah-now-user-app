import React from 'react'

export const TransliterationText: React.FC<{
  text: string
  fontSize: number
  maxWidth: number
}> = ({ text, fontSize, maxWidth }) => {
  if (!text) return null

  return (
    <div
      style={{
        textAlign: 'center',
        maxWidth,
        fontSize,
        color: 'rgba(255,255,255,0.72)',
        fontStyle: 'italic',
        lineHeight: 1.3,
      }}
    >
      {text}
    </div>
  )
}
