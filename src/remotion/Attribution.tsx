import React from 'react'

export const Attribution: React.FC<{
  reciterName: string
  attributionLine: string
  width: number
  height: number
}> = ({ reciterName, attributionLine, width, height }) => {
  const fontSize = width * 0.024

  return (
    <div
      style={{
        position: 'absolute',
        bottom: height * 0.025,
        left: width * 0.035,
        color: 'rgba(255,255,255,0.55)',
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1.2,
        maxWidth: width * 0.55,
        fontSize,
        pointerEvents: 'none',
      }}
    >
      {attributionLine && <div style={{ marginBottom: 2 }}>{attributionLine}</div>}
      <div>Recited by {reciterName}</div>
    </div>
  )
}
