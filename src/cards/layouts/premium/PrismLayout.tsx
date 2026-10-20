import React from 'react'
import { lowPolyCorner } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const PrismLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const size = pick(p.format, 420, 360, 460)
  const facets = (seed: number) => lowPolyCorner(seed, size, 6).map((f, i) => <polygon key={i} points={f.points} fill={t.accent} opacity={f.opacity} stroke={t.accent} strokeWidth="0.6" strokeOpacity="0.4" />)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          <g>{facets(6)}</g>
          <g transform={`translate(${w} ${h}) rotate(180)`}>{facets(19)}</g>
          <line x1={size + 30} y1="60" x2={w - 60} y2="60" stroke={t.accent} strokeWidth="1" opacity="0.5" />
          <line x1="60" y1={h - 60} x2={w - size - 30} y2={h - 60} stroke={t.accent} strokeWidth="1" opacity="0.5" />
        </>
      }
    />
  )
}
