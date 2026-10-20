import React from 'react'
import { polar, starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const CompassLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [cx, cy] = [w / 2, h / 2]
  const r = pick(p.format, 480, 440, 500)
  const ticks = Array.from({ length: 72 }, (_, i) => (i * Math.PI) / 36)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <g stroke={t.accent} fill="none" opacity={t.light ? 0.3 : 0.24}>
          <circle cx={cx} cy={cy} r={r} strokeWidth="2" />
          <circle cx={cx} cy={cy} r={r - 30} strokeWidth="0.8" />
          {ticks.map((a, i) => {
            const [[x1, y1], [x2, y2]] = [polar(cx, cy, r, a), polar(cx, cy, r - (i % 9 ? 12 : 30), a)]
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={i % 9 ? 0.8 : 1.8} />
          })}
          <path d={starPath(cx, cy, 4, r - 40, r * 0.12)} strokeWidth="1.4" />
          <path d={starPath(cx, cy, 4, r * 0.6, r * 0.1, -Math.PI / 4)} strokeWidth="1" />
          <path d={`M${cx} ${cy - r - 46} l-14 26 h28 Z`} fill={t.accent} />
          <circle cx={cx} cy={cy} r={r * 0.22} strokeWidth="1" strokeDasharray="2 6" />
        </g>
      }
    />
  )
}
