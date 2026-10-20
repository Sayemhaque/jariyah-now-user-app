import React from 'react'
import { scatter } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Cluster({ seed, x, y, color }: { seed: number; x: number; y: number; color: string }) {
  const stars = scatter(seed, 6, x, y, 150, 250).sort((a, b) => a.x - b.x)
  return (
    <g>
      <path d={stars.map((s, i) => `${i ? 'L' : 'M'}${s.x} ${s.y}`).join(' ')} fill="none" stroke={color} strokeWidth="0.9" opacity="0.5" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r + 1.4} fill={color} opacity={0.6 + s.o * 0.4} />)}
      {stars.filter((s) => s.r > 2.4).map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * 3} fill="none" stroke={color} opacity="0.3" />)}
    </g>
  )
}

export const ConstellationLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const field = scatter(17, 60, 0, 0, w, h)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          {field.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.6} fill={t.accent} opacity={s.o * 0.45} />)}
          <Cluster seed={21} x={24} y={pick(p.format, 30, 24, 120)} color={t.accent} />
          <Cluster seed={34} x={w - 174} y={h - pick(p.format, 290, 280, 420)} color={t.accent} />
        </>
      }
    />
  )
}
