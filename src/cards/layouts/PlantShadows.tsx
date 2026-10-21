import React from 'react'

const f = (n: number) => n.toFixed(1)

function leafPath(x: number, y: number, angle: number, length: number, width: number): string {
  const tip = [x + Math.cos(angle) * length, y + Math.sin(angle) * length]
  const n = [Math.cos(angle + Math.PI / 2) * width, Math.sin(angle + Math.PI / 2) * width]
  const mid = [x + Math.cos(angle) * length * 0.45, y + Math.sin(angle) * length * 0.45]
  return `M${f(x)} ${f(y)} Q${f(mid[0]! + n[0]!)} ${f(mid[1]! + n[1]!)} ${f(tip[0]!)} ${f(tip[1]!)} Q${f(mid[0]! - n[0]!)} ${f(mid[1]! - n[1]!)} ${f(x)} ${f(y)}Z`
}

export const OliveShadow: React.FC<{ width: number; height: number; color: string }> = ({ width, height, color }) => {
  const stem: string[] = []
  const leaves: string[] = []
  const start = [-40, height * 0.08]
  for (let i = 0; i <= 18; i++) {
    const t = i / 18
    const x = start[0]! + width * 0.62 * t
    const y = start[1]! + height * 0.2 * t + Math.sin(t * 3) * 40
    stem.push(`${i ? 'L' : 'M'}${f(x)} ${f(y)}`)
    if (i < 18) {
      const side = i % 2 ? 1 : -1
      leaves.push(leafPath(x, y, 0.35 + side * 0.95 + t * 0.2, 150 - t * 60, 16))
    }
  }
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, filter: 'blur(6px)', mixBlendMode: 'multiply' }}>
      <path d={stem.join(' ')} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
      {leaves.map((d, i) => <path key={i} d={d} fill={color} />)}
    </svg>
  )
}

export const MonsteraShadow: React.FC<{ width: number; height: number; color: string }> = ({ width, height, color }) => {
  const cx = width * 0.86
  const cy = height * 0.3
  const lobes: string[] = []
  for (let k = 0; k < 11; k++) {
    const a0 = -2.4 + k * 0.43
    const a1 = a0 + 0.33
    const r = width * (0.36 - Math.abs(k - 5) * 0.014)
    const p0 = [cx + Math.cos(a0) * r * 0.18, cy + Math.sin(a0) * r * 0.18]
    lobes.push(`M${f(p0[0]!)} ${f(p0[1]!)} L${f(cx + Math.cos(a0) * r)} ${f(cy + Math.sin(a0) * r)} Q${f(cx + Math.cos((a0 + a1) / 2) * r * 1.12)} ${f(cy + Math.sin((a0 + a1) / 2) * r * 1.12)} ${f(cx + Math.cos(a1) * r)} ${f(cy + Math.sin(a1) * r)} L${f(cx + Math.cos(a1) * r * 0.18)} ${f(cy + Math.sin(a1) * r * 0.18)}Z`)
  }
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, filter: 'blur(8px)', mixBlendMode: 'multiply', transform: 'rotate(-18deg)', transformOrigin: '86% 30%' }}>
      <circle cx={cx} cy={cy} r={width * 0.07} fill={color} />
      {lobes.map((d, i) => <path key={i} d={d} fill={color} />)}
      <path d={`M${f(cx)} ${f(cy)} Q${f(cx + 30)} ${f(height * 0.7)} ${f(cx + 90)} ${f(height * 1.05)}`} stroke={color} strokeWidth="14" fill="none" />
    </svg>
  )
}
