import React from 'react'
import { marbleVeins, scatter } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const MarbleLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const m = pick(p.format, 56, 48, 70)
  const veins = marbleVeins(w, h, 11)
  const flakes = [...scatter(5, 9, m - 20, m - 20, 220, 200), ...scatter(9, 9, w - m - 200, h - m - 180, 220, 200)]
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '128px 150px 120px', '104px 150px 96px', '290px 150px 310px')}
      art={
        <>
          {veins.map((v, i) => <path key={i} d={v.d} fill="none" stroke={i % 3 ? t.muted : t.accent} strokeWidth={v.width} opacity={v.opacity} strokeLinecap="round" />)}
          <rect x={m} y={m} width={w - 2 * m} height={h - 2 * m} fill="none" stroke={t.accent} strokeWidth="2.6" />
          <rect x={m + 9} y={m + 9} width={w - 2 * m - 18} height={h - 2 * m - 18} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.7" />
          {flakes.map((f, i) => (
            <path key={i} d={`M${f.x} ${f.y} l${f.r * 3} ${f.r} l${-f.r} ${f.r * 2.4} Z`} fill={t.accent} opacity={f.o} />
          ))}
        </>
      }
    />
  )
}
