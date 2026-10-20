import React from 'react'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const CoverLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const top = pick(p.format, 64, 52, 220)
  const bottom = h - pick(p.format, 60, 48, 240)
  const rule = w - 132
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      align="left"
      padding={`${top + 56}px 186px ${h - bottom + 50}px 110px`}
      gap={pick(p.format, 34, 24, 44)}
      art={
        <g fill={t.accent}>
          <rect x="96" y={top} width={w - 192} height="7" />
          <rect x="96" y={top + 15} width={w - 192} height="1.4" />
          <rect x="96" y={bottom - 16} width={w - 192} height="1.4" />
          <rect x="96" y={bottom - 7} width={w - 192} height="7" />
          <rect x={rule} y={top + 52} width="1.4" height={bottom - top - 104} opacity="0.6" />
          {[top + 52, (top + bottom) / 2, bottom - 52].map((y) => <rect key={y} x={rule - 6} y={y - 6} width="12" height="12" transform={`rotate(45 ${rule} ${y})`} />)}
        </g>
      }
    />
  )
}
