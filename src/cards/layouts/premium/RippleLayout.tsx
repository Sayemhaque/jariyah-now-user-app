import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const RippleLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const rings = Array.from({ length: 12 }, (_, i) => 120 + i * 110)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <g fill="none" stroke={t.accent}>
          {rings.map((r, i) => <circle key={r} cx={w / 2} cy={h + 60} r={r} strokeWidth={i % 3 ? 0.9 : 1.8} opacity={0.55 - i * 0.04} strokeDasharray={i % 4 === 2 ? '2 8' : undefined} />)}
          {rings.slice(0, 6).map((r, i) => <circle key={r} cx={w / 2} cy={-60} r={r * 0.7} strokeWidth="0.8" opacity={0.3 - i * 0.045} />)}
        </g>
      }
    />
  )
}
