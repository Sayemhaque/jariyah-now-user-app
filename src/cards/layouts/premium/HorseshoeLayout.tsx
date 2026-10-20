import React from 'react'
import { annularSector, round } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, tint, type LayoutProps } from '../layoutTypes'

const deg = Math.PI / 180

export const HorseshoeLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const r = pick(p.format, 380, 350, 390)
  const ring = 46
  const frameTop = pick(p.format, 44, 30, 220)
  const bottom = h - pick(p.format, 44, 30, 220)
  const [cx, cy] = [w / 2, frameTop + 40 + ring + r]
  const jamb = round(r * Math.cos(30 * deg))
  const span = r + ring + 40
  const stones = 15
  const step = (240 * deg) / stones
  return (
    <OrnamentLayout
      {...p}
      padding={`${cy - r + pick(p.format, 56, 40, 64)}px ${cx - jamb + 12}px ${h - bottom + pick(p.format, 56, 36, 80)}px`}
      gap={pick(p.format, 24, 16, 32)}
      art={
        <>
          <rect x={cx - span} y={frameTop} width={span * 2} height={bottom - frameTop} fill="none" stroke={t.accent} strokeWidth="1.6" opacity="0.8" />
          <path d={`M${cx - jamb} ${bottom} V${cy + r / 2} A${r} ${r} 0 1 1 ${cx + jamb} ${cy + r / 2} V${bottom} Z`} fill={panelFill(t)} stroke={t.accent} strokeWidth="2" />
          {Array.from({ length: stones }, (_, i) => (
            <path key={i} d={annularSector(cx, cy, r + 2, r + ring, 150 * deg + i * step, 150 * deg + (i + 1) * step)} fill={tint(t.accent, i % 2 ? 0.08 : t.light ? 0.4 : 0.34)} stroke={t.accent} strokeWidth="1" />
          ))}
          {[cx - jamb - ring * 0.6, cx + jamb + ring * 0.6].map((x) => <line key={x} x1={x} y1={cy + r / 2 + 30} x2={x} y2={bottom} stroke={t.accent} strokeWidth="1" opacity="0.6" />)}
        </>
      }
    />
  )
}
