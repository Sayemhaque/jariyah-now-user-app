import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, type LayoutProps } from '../layoutTypes'

function cartouche(left: number, right: number, top: number, bottom: number, lobe: number, knob: number): string {
  const cx = (left + right) / 2
  const end = (y: number, dir: number) => `Q${right} ${y} ${cx + 96} ${y} Q${cx + 34} ${y} ${cx} ${y - dir * knob} Q${cx - 34} ${y} ${cx - 96} ${y} Q${left} ${y} ${left} ${y + dir * lobe}`
  return `M${left} ${top + lobe} Q${left} ${top} ${cx - 96} ${top} Q${cx - 34} ${top} ${cx} ${top - knob} Q${cx + 34} ${top} ${cx + 96} ${top} Q${right} ${top} ${right} ${top + lobe} V${bottom - lobe} ${end(bottom, -1)} Z`
}

export const CartoucheLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const y0 = pick(p.format, 76, 64, 240)
  const ring = (i: number) => cartouche(84 + i, w - 84 - i, y0 + i, h - y0 - i, 130 - i * 0.6, 30 - i * 0.4)
  return (
    <OrnamentLayout
      {...p}
      padding={`${y0 + pick(p.format, 74, 62, 90)}px 156px ${y0 + pick(p.format, 66, 84, 80)}px`}
      gap={pick(p.format, 28, 20, 34)}
      art={
        <>
          <path d={ring(0)} fill="none" stroke={t.accent} strokeWidth="2.4" />
          <path d={ring(14)} fill="none" stroke={t.accent} strokeWidth="1.1" strokeDasharray="1.5 7" strokeLinecap="round" />
          <path d={ring(26)} fill={panelFill(t)} stroke={t.accent} strokeWidth="0.8" opacity="0.9" />
          {[y0 - 30, h - y0 + 30].map((y) => (
            <rect key={y} x={w / 2 - 8} y={y - 8} width="16" height="16" transform={`rotate(45 ${w / 2} ${y})`} fill={t.accent} />
          ))}
        </>
      }
    />
  )
}
