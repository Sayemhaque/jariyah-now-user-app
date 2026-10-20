import React from 'react'
import { meanderPath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const MeanderLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [mx, my] = [pick(p.format, 46, 40, 46), pick(p.format, 46, 40, 196)]
  const s = 28
  const across = meanderPath(w - 2 * mx, s)
  const down = meanderPath(h - 2 * my - 2 * s, s)
  return (
    <OrnamentLayout
      {...p}
      padding={`${my + s + pick(p.format, 66, 46, 80)}px 160px ${my + s + pick(p.format, 58, 40, 70)}px`}
      gap={pick(p.format, 28, 20, 34)}
      art={
        <>
          <g fill="none" stroke={t.accent} strokeWidth="2" strokeLinejoin="miter" opacity="0.85">
            <path d={across} transform={`translate(${mx} ${my})`} />
            <path d={across} transform={`translate(${w - mx} ${h - my}) rotate(180)`} />
            <path d={down} transform={`translate(${mx} ${h - my - s}) rotate(-90)`} />
            <path d={down} transform={`translate(${w - mx} ${my + s}) rotate(90)`} />
          </g>
          <rect x={mx - 10} y={my - 10} width={w - 2 * mx + 20} height={h - 2 * my + 20} fill="none" stroke={t.accent} strokeWidth="1.2" opacity="0.6" />
          <rect x={mx + s + 12} y={my + s + 12} width={w - 2 * mx - 2 * s - 24} height={h - 2 * my - 2 * s - 24} fill="none" stroke={t.accent} strokeWidth="0.8" opacity="0.5" />
        </>
      }
    />
  )
}
