import React from 'react'

function frond(x: number, y: number, angle: number, length: number, side: number): string {
  const parts: string[] = []
  for (let i = 1; i <= 14; i++) {
    const t = i / 15
    const px = x + Math.cos(angle) * length * t
    const py = y + Math.sin(angle) * length * t
    for (const dir of [-1, 1]) {
      const a = angle + dir * (1.05 - t * 0.35) * side
      const leaf = length * (0.34 - t * 0.16)
      const ex = px + Math.cos(a) * leaf
      const ey = py + Math.sin(a) * leaf
      const nx = Math.cos(a + Math.PI / 2) * leaf * 0.09
      const ny = Math.sin(a + Math.PI / 2) * leaf * 0.09
      parts.push(`M${px.toFixed(1)} ${py.toFixed(1)} Q${((px + ex) / 2 + nx).toFixed(1)} ${((py + ey) / 2 + ny).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${((px + ex) / 2 - nx).toFixed(1)} ${((py + ey) / 2 - ny).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}Z`)
    }
  }
  return parts.join(' ')
}

export const PalmShadow: React.FC<{ width: number; height: number; color: string }> = ({ width, height, color }) => {
  const base = { x: width * 1.02, y: height * 0.98 }
  const fronds = [
    frond(base.x, base.y, -1.95, height * 0.62, 1),
    frond(base.x, base.y, -2.35, height * 0.5, 1),
    frond(base.x, base.y, -1.62, height * 0.56, -1),
    frond(base.x - width * 0.06, base.y - height * 0.38, -2.7, height * 0.34, 1),
  ]
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, filter: 'blur(7px)', mixBlendMode: 'multiply' }}>
      {fronds.map((d, i) => <path key={i} d={d} fill={color} />)}
      <path d={`M${base.x} ${base.y} Q${width * 0.84} ${height * 0.62} ${width * 0.7} ${height * 0.36}`} stroke={color} strokeWidth="6" fill="none" />
    </svg>
  )
}

export const WindowLight: React.FC<{ light: boolean }> = ({ light }) => (
  <>
    <div style={{ position: 'absolute', inset: '-10%', background: `linear-gradient(118deg, transparent 18%, ${light ? 'rgba(255,248,232,0.75)' : 'rgba(255,240,210,0.12)'} 30%, transparent 44%, transparent 52%, ${light ? 'rgba(255,248,232,0.6)' : 'rgba(255,240,210,0.09)'} 62%, transparent 76%)`, filter: 'blur(26px)' }} />
    <div style={{ position: 'absolute', top: '-10%', bottom: '-10%', right: '13%', width: 46, background: light ? 'rgba(90,64,36,0.14)' : 'rgba(0,0,0,0.3)', transform: 'skewX(-14deg)', filter: 'blur(14px)' }} />
    <div style={{ position: 'absolute', top: '-10%', bottom: '-10%', right: '27%', width: 22, background: light ? 'rgba(90,64,36,0.1)' : 'rgba(0,0,0,0.22)', transform: 'skewX(-14deg)', filter: 'blur(12px)' }} />
  </>
)
