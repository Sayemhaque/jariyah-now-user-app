import React from 'react'
import { manuscriptColors as colors } from './manuscriptLayout'

const Corner: React.FC<{ size: number; style: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ position: 'absolute', width: size, height: size, ...style }}>
    {[0, 45].map((angle) => (
      <div
        key={angle}
        style={{ position: 'absolute', inset: size * 0.2, background: `linear-gradient(135deg, #e7c46a, ${colors.leaf})`, transform: `rotate(${angle}deg)` }}
      />
    ))}
  </div>
)

export const ManuscriptFrame: React.FC<{ unit: number }> = ({ unit }) => {
  const inset = unit * 22
  const corner = unit * 64
  const offset = -corner * 0.16
  return (
    <div style={{ position: 'absolute', inset, border: `${unit * 3}px solid ${colors.gold}`, borderRadius: unit * 4 }}>
      <div style={{ position: 'absolute', inset: unit * 10, border: `${Math.max(1, unit)}px solid ${colors.gold}` }} />
      <Corner size={corner} style={{ top: offset, left: offset }} />
      <Corner size={corner} style={{ top: offset, right: offset }} />
      <Corner size={corner} style={{ bottom: offset, left: offset }} />
      <Corner size={corner} style={{ bottom: offset, right: offset }} />
    </div>
  )
}
