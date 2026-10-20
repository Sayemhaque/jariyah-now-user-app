import React from 'react'
import { moonPath, ridgePath } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

export const MountainsLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const rise = pick(p.format, 1, 0.8, 1.3)
  const ridges = [
    { height: 300 * rise, seed: 2, opacity: 0.12 },
    { height: 220 * rise, seed: 7, opacity: 0.2 },
    { height: 140 * rise, seed: 13, opacity: 0.34 },
  ]
  return (
    <OrnamentLayout
      {...p}
      padding={`${pick(p.format, 110, 92, 270)}px 150px ${Math.round(150 * rise + 30)}px`}
      art={
        <>
          <path d={moonPath(w - 110, h - 300 * rise - 150, 30, 0.16)} fill={t.accent} opacity="0.8" />
          {ridges.map((r) => <path key={r.seed} d={ridgePath(w, h, r.height, r.seed)} fill={t.accent} opacity={r.opacity} />)}
        </>
      }
    />
  )
}
