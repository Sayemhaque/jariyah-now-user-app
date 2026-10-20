import React from 'react'
import { zigzagPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const ChevronLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const top = pick(p.format, 44, 36, 190)
  const rows = [0, 22, 44]
  const band = (y: number, dir: number) => rows.map((dy, i) => (
    <path key={dy} d={zigzagPath(-20, w + 20, y + dir * dy, 14 * dir, 52)} fill="none" stroke={t.accent} strokeWidth={2.2 - i * 0.6} opacity={0.85 - i * 0.25} strokeLinejoin="miter" />
  ))
  return (
    <OrnamentLayout
      {...p}
      padding={`${top + pick(p.format, 110, 84, 120)}px 150px ${top + pick(p.format, 100, 76, 110)}px`}
      art={
        <>
          {band(top + 14, 1)}
          {band(h - top, -1)}
        </>
      }
    />
  )
}
