import React from 'react'
import { petalPath, starPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Rosette({ x, y, r, color, weight }: { x: number; y: number; r: number; color: string; weight: number }) {
  return (
    <g fill="none" stroke={color} strokeWidth={weight}>
      <path d={petalPath(x, y, 16, r * 0.3, r)} />
      <path d={petalPath(x, y, 16, r * 0.24, r * 0.72, 0.42)} transform={`rotate(11.25 ${x} ${y})`} />
      <circle cx={x} cy={y} r={r * 0.3} />
      <path d={starPath(x, y, 8, r * 0.26, r * 0.12)} fill={color} fillOpacity="0.4" />
    </g>
  )
}

export const RosetteLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const c = pick(p.format, 92, 84, 110)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <>
          <g opacity={t.light ? 0.24 : 0.2}>
            <Rosette x={w / 2} y={h / 2} r={pick(p.format, 470, 430, 500)} color={t.accent} weight={1.4} />
          </g>
          {[[c, c], [w - c, c], [c, h - c], [w - c, h - c]].map(([x, y], i) => (
            <g key={i} opacity="0.85"><Rosette x={x!} y={y!} r={46} color={t.accent} weight={1.1} /></g>
          ))}
        </>
      }
    />
  )
}
