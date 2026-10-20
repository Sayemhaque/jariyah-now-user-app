import React from 'react'
import { multifoilArchPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, type LayoutProps } from '../layoutTypes'

export const MultifoilLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const top = pick(p.format, 70, 52, 240)
  const bottom = h - pick(p.format, 50, 38, 220)
  const [x0, x1] = [96, w - 96]
  const spring = top + (x1 - x0) / 2
  const arch = (i: number) => multifoilArchPath(x0 + i, x1 - i, spring, bottom - i, 9)
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + pick(p.format, 170, 140, 190)}px 160px ${h - bottom + pick(p.format, 60, 44, 76)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <path d={arch(0)} fill={panelFill(t)} stroke={t.accent} strokeWidth="2.4" />
          <path d={arch(16)} fill="none" stroke={t.accent} strokeWidth="0.9" opacity="0.7" />
          <path d={arch(28)} fill="none" stroke={t.accent} strokeWidth="0.8" strokeDasharray="1.5 6" strokeLinecap="round" opacity="0.8" />
          <rect x={x0 - 26} y={top - 30} width={x1 - x0 + 52} height={bottom - top + 30} fill="none" stroke={t.accent} strokeWidth="1" opacity="0.45" />
        </>
      }
    />
  )
}
