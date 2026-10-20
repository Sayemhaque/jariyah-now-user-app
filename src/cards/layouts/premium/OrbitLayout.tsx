import React from 'react'
import { round } from '@/lib/cards/shapes'
import { OrnamentLayout } from '../OrnamentLayout'
import { pick, type LayoutProps } from '../layoutTypes'

const orbits = [
  { rx: 500, ry: 150, tilt: -18, at: 0.6, size: 9 },
  { rx: 470, ry: 120, tilt: 26, at: 3.6, size: 6 },
  { rx: 430, ry: 210, tilt: 72, at: 5.2, size: 7 },
]

export const OrbitLayout: React.FC<LayoutProps> = (p) => {
  const { width: w, height: h, theme: t } = p
  const [cx, cy] = [w / 2, h / 2]
  const scale = pick(p.format, 1, 0.9, 1.06)
  return (
    <OrnamentLayout
      {...p}
      pattern={false}
      padding={pick(p.format, '120px 150px 112px', '100px 150px 92px', '280px 150px 300px')}
      art={
        <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
          {orbits.map((o, i) => (
            <g key={i} transform={`rotate(${o.tilt})`}>
              <ellipse rx={o.rx} ry={o.ry} fill="none" stroke={t.accent} strokeWidth="1" opacity={t.light ? 0.42 : 0.34} />
              <circle cx={round(o.rx * Math.cos(o.at))} cy={round(o.ry * Math.sin(o.at))} r={o.size} fill={t.accent} />
              <circle cx={round(o.rx * Math.cos(o.at))} cy={round(o.ry * Math.sin(o.at))} r={o.size * 2.4} fill="none" stroke={t.accent} opacity="0.4" />
            </g>
          ))}
        </g>
      }
    />
  )
}
