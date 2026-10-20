import React from 'react'
import { polygonPath, starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const GirihLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [cx, cy] = [w / 2, h / 2]
  const r = pick(p.format, 520, 470, 540)
  const inner = r * 0.56
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          <g fill="none" stroke={t.accent} opacity={t.light ? 0.3 : 0.24}>
            <path d={starPath(cx, cy, 12, r, r * 0.66)} strokeWidth="2" />
            <path d={starPath(cx, cy, 12, r * 0.9, r * 0.6)} strokeWidth="0.8" />
            <path d={polygonPath(cx, cy, 12, r * 0.66, -Math.PI / 2 + Math.PI / 12)} strokeWidth="1" strokeDasharray="3 7" />
            <path d={starPath(cx, cy, 12, inner, inner * 0.62, -Math.PI / 2 + Math.PI / 12)} strokeWidth="1.4" />
            <path d={polygonPath(cx, cy, 6, inner * 0.62)} strokeWidth="0.8" />
            <path d={polygonPath(cx, cy, 6, inner * 0.62, 0)} strokeWidth="0.8" />
          </g>
          <rect x={60} y={60} width={w - 120} height={h - 120} fill="none" stroke={t.accent} strokeWidth="1" opacity="0.5" />
        </>
      }
    />
  )
}
