import React from 'react'

interface GoldDividerProps {
  width: number
  color: string
  opacity: number
}

export const GoldDivider: React.FC<GoldDividerProps> = ({ width, color, opacity }) => {
  const diamond = Math.max(5, width * 0.035)
  const line = { flex: 1, height: 1 }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: diamond, width, margin: `${diamond * 1.6}px 0`, opacity }}>
      <div style={{ ...line, background: `linear-gradient(90deg, transparent, ${color})` }} />
      <div
        style={{
          width: diamond,
          height: diamond,
          transform: 'rotate(45deg)',
          background: color,
          boxShadow: `0 0 ${diamond * 1.5}px ${color}`,
        }}
      />
      <div style={{ ...line, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  )
}
