import React from 'react'
import { quadPoint, type Point } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

const leafStops = [0.04, 0.1, 0.16, ...Array.from({ length: 11 }, (_, i) => 0.46 + i * 0.052)]

function Branch({ p0, p1, p2, side, color }: { p0: Point; p1: Point; p2: Point; side: 1 | -1; color: string }) {
  const leaves = leafStops.map((t) => quadPoint(t, p0, p1, p2))
  return (
    <g fill={color} stroke={color}>
      <path d={`M${p0.join(' ')} Q${p1.join(' ')} ${p2.join(' ')}`} fill="none" strokeWidth="2.2" strokeLinecap="round" />
      {leaves.map(({ point: [x, y], angle }, i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <ellipse cx="14" cy={-14 * side} rx="22" ry="7.5" transform={`rotate(${-38 * side})`} fillOpacity={i % 2 ? 0.85 : 0.55} strokeWidth="0.8" />
          <ellipse cx="14" cy={14 * side} rx="22" ry="7.5" transform={`rotate(${38 * side})`} fillOpacity={i % 2 ? 0.55 : 0.85} strokeWidth="0.8" />
        </g>
      ))}
      <circle cx={p2[0]} cy={p2[1]} r="5" />
    </g>
  )
}

export const LaurelLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const cx = w / 2
  const by = h - pick(p.format, 62, 50, 230)
  const reach = pick(p.format, 560, 470, 640)
  return (
    <OrnamentLayout
      {...p}
      padding={`${pick(p.format, 110, 92, 270)}px 200px ${h - by + pick(p.format, 100, 88, 100)}px`}
      art={
        <g opacity="0.8">
          <Branch p0={[cx - 24, by]} p1={[cx - 500, by]} p2={[cx - 410, by - reach]} side={1} color={t.accent} />
          <Branch p0={[cx + 24, by]} p1={[cx + 500, by]} p2={[cx + 410, by - reach]} side={-1} color={t.accent} />
          <path d={`M${cx - 30} ${by - 6} Q${cx} ${by + 20} ${cx + 30} ${by - 6} M${cx - 8} ${by + 6} l-18 34 M${cx + 8} ${by + 6} l18 34`} stroke={t.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      }
    />
  )
}
