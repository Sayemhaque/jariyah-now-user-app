import React from 'react'
import { polar } from '@/lib/cards/shapes'
import { useSvgId } from '../../useSvgId'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, type LayoutProps } from '../layoutTypes'

const arched = (left: number, right: number, top: number, bottom: number) => {
  const r = (right - left) / 2
  return `M${left} ${bottom} V${top + r} A${r} ${r} 0 0 1 ${right} ${top + r} V${bottom} Z`
}

export const WindowLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const svgId = useSvgId('window')
  const [x0, x1] = [110, w - 110]
  const top = pick(p.format, 56, 42, 220)
  const bottom = h - pick(p.format, 56, 42, 220)
  const r = (x1 - x0) / 2
  const rays = Array.from({ length: 11 }, (_, i) => Math.PI + ((i + 1) * Math.PI) / 12)
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + 170}px 160px ${h - bottom + pick(p.format, 64, 46, 80)}px`}
      gap={pick(p.format, 28, 20, 34)}
      art={
        <>
          <defs>
            <linearGradient id={svgId('glow')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={t.accent} stopOpacity={t.light ? 0.26 : 0.22} />
              <stop offset="0.5" stopColor={t.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={arched(x0, x1, top, bottom)} fill={panelFill(t)} />
          <path d={arched(x0, x1, top, bottom)} fill={`url(#${svgId('glow')})`} stroke={t.accent} strokeWidth="2.4" />
          <path d={arched(x0 + 18, x1 - 18, top + 18, bottom - 18)} fill="none" stroke={t.accent} strokeWidth="0.9" opacity="0.7" />
          <g stroke={t.accent} strokeWidth="1" opacity="0.28">
            {rays.map((a) => {
              const [[x1, y1], [x2, y2]] = [polar(w / 2, top + r, r * 0.32, a), polar(w / 2, top + r, r - 18, a)]
              return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} />
            })}
            <path d={`M${w / 2 - r * 0.32} ${top + r} A${r * 0.32} ${r * 0.32} 0 0 1 ${w / 2 + r * 0.32} ${top + r}`} fill="none" />
          </g>
        </>
      }
    />
  )
}
