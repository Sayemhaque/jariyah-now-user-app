import React from 'react'
import { moonPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, tint, type LayoutProps } from '../layoutTypes'

function Minaret({ x, top, base, color, fill }: { x: number; top: number; base: number; color: string; fill: string }) {
  const balcony = (y: number) => <path d={`M${x - 30} ${y} H${x + 30} L${x + 22} ${y + 14} H${x - 22} Z`} />
  return (
    <g stroke={color} strokeWidth="1.4" fill={fill} strokeLinejoin="round">
      <path d={moonPath(x, top - 40, 9, 0.18)} fill={color} stroke="none" />
      <line x1={x} y1={top - 28} x2={x} y2={top} />
      <path d={`M${x - 16} ${top + 64} L${x} ${top} L${x + 16} ${top + 64} Z`} />
      <rect x={x - 13} y={top + 64} width="26" height="62" />
      {balcony(top + 126)}
      <rect x={x - 18} y={top + 140} width="36" height={base - top - 196} />
      {balcony((top + base) / 2)}
      {[-7, 7].map((dx) => <line key={dx} x1={x + dx} y1={top + 160} x2={x + dx} y2={base - 70} strokeWidth="0.7" opacity="0.6" />)}
      <rect x={x - 28} y={base - 56} width="56" height="56" />
      <path d={`M${x - 12} ${base} V${base - 26} A12 12 0 0 1 ${x + 12} ${base - 26} V${base}`} fill="none" />
    </g>
  )
}

export const MinaretLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const top = pick(p.format, 150, 110, 330)
  const base = h - pick(p.format, 54, 44, 250)
  const fill = t.light ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.05)'
  return (
    <OrnamentLayout
      {...p}
      padding={pick(p.format, '120px 170px 110px', '96px 170px 84px', '290px 170px 320px')}
      behind={<div style={{ position: 'absolute', inset: 0, background: `linear-gradient(0deg, ${tint(t.accent, 0.18)} 0, transparent 30%)` }} />}
      art={
        <>
          <line x1="40" y1={base} x2={w - 40} y2={base} stroke={t.accent} strokeWidth="1.2" opacity="0.6" />
          <Minaret x={84} top={top} base={base} color={t.accent} fill={fill} />
          <Minaret x={w - 84} top={top} base={base} color={t.accent} fill={fill} />
        </>
      }
    />
  )
}
