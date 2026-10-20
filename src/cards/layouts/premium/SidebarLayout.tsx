import React from 'react'
import { starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { bandTheme, pick, type LayoutProps } from '../layoutTypes'

export const SidebarLayout: React.FC<LayoutProps> = (p) => {
  const { height: h, theme: t } = p
  const band = bandTheme(t)
  const bw = 150
  const stars = Array.from({ length: Math.ceil(h / 90) + 1 }, (_, i) => i * 90 + 20)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      align="left"
      padding={pick(p.format, '110px 110px 100px 226px', '92px 110px 86px 226px', '270px 110px 290px 226px')}
      gap={pick(p.format, 32, 22, 42)}
      art={
        <>
          <rect x="0" y="0" width={bw} height={h} fill={band.background} />
          <g fill="none" stroke={band.accent} strokeWidth="1.2" opacity="0.5">
            {stars.map((y, i) => <path key={y} d={starPath(bw / 2, y, 8, 30, 14, i % 2 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / 8)} />)}
            {stars.map((y) => <line key={y} x1={bw / 2} y1={y + 30} x2={bw / 2} y2={y + 60} />)}
          </g>
          <rect x={bw} y="0" width="5" height={h} fill={t.accent} />
          <rect x={bw + 14} y="0" width="1.2" height={h} fill={t.accent} opacity="0.6" />
        </>
      }
    />
  )
}
