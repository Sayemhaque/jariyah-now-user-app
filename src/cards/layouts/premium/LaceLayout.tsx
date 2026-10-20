import React from 'react'
import { perimeterPoints, scallopRect } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, tint, type LayoutProps } from '../layoutTypes'

export const LaceLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [mx, my] = [pick(p.format, 66, 56, 66), pick(p.format, 66, 56, 216)]
  const holes = perimeterPoints(mx + 14, my + 14, w - 2 * mx - 28, h - 2 * my - 28, 22)
  return (
    <OrnamentLayout
      {...p}
      padding={`${my + pick(p.format, 64, 46, 80)}px 156px ${my + pick(p.format, 56, 40, 70)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <path d={scallopRect(mx, my, w - 2 * mx, h - 2 * my, 16)} fill={tint(t.accent, t.light ? 0.16 : 0.12)} stroke={t.accent} strokeWidth="1.4" />
          <path d={scallopRect(mx + 28, my + 28, w - 2 * mx - 56, h - 2 * my - 56, 9)} fill={panelFill(t)} stroke={t.accent} strokeWidth="0.8" opacity="0.8" />
          {holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 2.2 : 3.6} fill="none" stroke={t.accent} strokeWidth="1" />)}
        </>
      }
    />
  )
}
