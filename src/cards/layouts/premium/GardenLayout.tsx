import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

function Scroll({ y, width, flip, color }: { y: number; width: number; flip: boolean; color: string }) {
  const unit = 120
  const count = Math.ceil(width / unit)
  const offset = (width - count * unit) / 2
  return (
    <g transform={flip ? `translate(0 ${2 * y}) scale(1 -1)` : undefined} stroke={color} fill="none" strokeLinecap="round">
      <path d={Array.from({ length: count }, (_, i) => `M${offset + i * unit} ${y} C${offset + i * unit + 30} ${y - 34} ${offset + i * unit + 90} ${y + 34} ${offset + (i + 1) * unit} ${y}`).join(' ')} strokeWidth="2" />
      {Array.from({ length: count }, (_, i) => {
        const x = offset + i * unit + 30
        return (
          <g key={i}>
            <path d={`M${x} ${y - 18} c-6 -16 10 -26 18 -16 c6 8 -4 16 -10 10`} strokeWidth="1.4" />
            <path d={`M${x + 60} ${y + 18} c6 16 -10 26 -18 16 c-6 -8 4 -16 10 -10`} strokeWidth="1.4" />
            <ellipse cx={x + 30} cy={y} rx="12" ry="5" transform={`rotate(-40 ${x + 30} ${y})`} fill={color} fillOpacity="0.5" />
          </g>
        )
      })}
      <line x1={offset} y1={y - 44} x2={width - offset} y2={y - 44} strokeWidth="0.8" opacity="0.6" />
      <line x1={offset} y1={y + 44} x2={width - offset} y2={y + 44} strokeWidth="0.8" opacity="0.6" />
    </g>
  )
}

export const GardenLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const band = pick(p.format, 74, 66, 220)
  return (
    <OrnamentLayout
      {...p}
      padding={`${band + pick(p.format, 74, 56, 90)}px 150px ${band + pick(p.format, 66, 50, 80)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <g opacity="0.85">
          <Scroll y={band} width={w} flip={false} color={t.accent} />
          <Scroll y={h - band} width={w} flip color={t.accent} />
        </g>
      }
    />
  )
}
