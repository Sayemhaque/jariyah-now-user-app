import React from 'react'
import { moonPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

const phases = [0.08, 0.16, 0.25, 0.36, 0.5, 0.64, 0.75, 0.84, 0.92]

function MoonRow({ y, width, color }: { y: number; width: number; color: string }) {
  const gap = 78
  const start = width / 2 - gap * 4
  return (
    <g>
      <line x1={start - 60} y1={y} x2={width - start + 60} y2={y} stroke={color} strokeWidth="0.8" opacity="0.4" />
      {phases.map((phase, i) => (
        <g key={phase}>
          <circle cx={start + i * gap} cy={y} r={i === 4 ? 17 : 13} fill="none" stroke={color} strokeWidth="0.9" opacity="0.6" />
          <path d={moonPath(start + i * gap, y, i === 4 ? 17 : 13, phase)} fill={color} />
        </g>
      ))}
    </g>
  )
}

export const MoonphaseLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const y = pick(p.format, 64, 50, 190)
  return (
    <OrnamentLayout
      {...p}
      padding={`${y + pick(p.format, 66, 52, 80)}px 150px ${y + pick(p.format, 58, 44, 80)}px`}
      art={
        <>
          <MoonRow y={y} width={w} color={t.accent} />
          <MoonRow y={h - y} width={w} color={t.accent} />
        </>
      }
    />
  )
}
