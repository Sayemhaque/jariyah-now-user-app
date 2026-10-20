import React from 'react'
import { pointedArchPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { panelFill, pick, type LayoutProps } from '../layoutTypes'

export const TriplearchLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const top = pick(p.format, 44, 34, 200)
  const bottom = h - pick(p.format, 44, 34, 200)
  const shoulder = top + pick(p.format, 330, 260, 380)
  const arch = (i: number) => pointedArchPath(70 + i, w - 70 - i, top + i * 1.3, shoulder + i * 0.4, bottom - i * 0.6)
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + pick(p.format, 230, 170, 270)}px 170px ${h - bottom + pick(p.format, 86, 64, 100)}px`}
      gap={pick(p.format, 26, 18, 34)}
      art={
        <>
          <path d={arch(0)} fill="none" stroke={t.accent} strokeWidth="2.6" />
          <path d={arch(30)} fill="none" stroke={t.accent} strokeWidth="1.2" strokeDasharray="1.5 7" strokeLinecap="round" />
          <path d={arch(58)} fill={panelFill(t)} stroke={t.accent} strokeWidth="1.4" />
          <path d={arch(70)} fill="none" stroke={t.accent} strokeWidth="0.6" opacity="0.6" />
          <circle cx={w / 2} cy={top - 4} r="7" fill={t.accent} />
        </>
      }
    />
  )
}
