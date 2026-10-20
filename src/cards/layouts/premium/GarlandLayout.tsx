import React from 'react'
import { moonPath, starPath, swagPath, swagPoints } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Charm({ x, y, drop, kind, color }: { x: number; y: number; drop: number; kind: number; color: string }) {
  const end = y + drop
  return (
    <g fill={color}>
      <line x1={x} y1={y} x2={x} y2={end} stroke={color} strokeWidth="1" opacity="0.7" />
      {kind === 0 && <path d={starPath(x, end + 14, 8, 15, 7)} />}
      {kind === 1 && <path d={moonPath(x, end + 16, 16, 0.14)} />}
      {kind === 2 && <path d={`M${x - 8} ${end} h16 l6 12 l-6 26 h-16 l-6 -26 Z`} fillOpacity="0.75" />}
    </g>
  )
}

export const GarlandLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, theme: t } = p
  const y = pick(p.format, 18, 14, 150)
  const points = swagPoints(-10, w + 10, y, 4)
  const sag = pick(p.format, 44, 36, 52)
  const middles = points.slice(1).map(([x], i) => ({ x: (x + points[i]![0]) / 2, top: y + sag, drop: 18 + (i % 2) * 24, kind: i % 3 }))
  const joins = points.slice(1, -1).map(([x], i) => ({ x, top: y, drop: 40, kind: (i + 2) % 3 }))
  return (
    <OrnamentLayout
      {...p}
      padding={`${y + sag + pick(p.format, 120, 96, 130)}px 150px ${pick(p.format, 104, 88, 300)}px`}
      art={
        <>
          <path d={swagPath(points, sag)} fill="none" stroke={t.accent} strokeWidth="1.6" />
          <path d={swagPath(points, sag * 0.7)} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.5" />
          {[...middles, ...joins].map((c, i) => <Charm key={i} x={c.x} y={c.top} drop={c.drop} kind={c.kind} color={t.accent} />)}
        </>
      }
    />
  )
}
