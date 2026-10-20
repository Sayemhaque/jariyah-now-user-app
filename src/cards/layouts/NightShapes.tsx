import React from 'react'
import { mulberry32 } from '@/lib/daily/plan'

export const StarField: React.FC<{ width: number; height: number; color: string }> = ({ width, height, color }) => {
  const id = React.useId().replace(/:/g, '')
  const rand = mulberry32(42)
  const stars = Array.from({ length: 70 }, () => ({ x: rand() * width, y: rand() * height, r: 0.8 + rand() * 2.2, o: 0.25 + rand() * 0.6 }))
  return (
    <g>
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={color} opacity={s.o} />)}
      <mask id={`moon${id}`}>
        <circle cx={width - 190} cy={150} r={58} fill="white" />
        <circle cx={width - 164} cy={134} r={52} fill="black" />
      </mask>
      <circle cx={width - 190} cy={150} r={58} fill={color} opacity="0.92" mask={`url(#moon${id})`} />
    </g>
  )
}

function skylinePath(width: number, base: number, skyline: number): string {
  const unit = width / 12
  const dome = (cx: number, r: number, h: number) => `L${cx - r} ${base - h} Q${cx - r} ${base - h - r * 1.4} ${cx} ${base - h - r * 1.7} Q${cx + r} ${base - h - r * 1.4} ${cx + r} ${base - h}`
  const minaret = (x: number, h: number) => `L${x} ${base - h} L${x + 10} ${base - h - 30} L${x + 20} ${base - h} L${x + 20} ${base - skyline * 0.3}`
  return [
    `M0 ${base}`,
    `L0 ${base - skyline * 0.32}`,
    minaret(unit * 1.6, skyline * 0.95),
    dome(unit * 4, unit * 1.1, skyline * 0.42),
    dome(unit * 6, unit * 1.6, skyline * 0.5),
    dome(unit * 8, unit * 1.1, skyline * 0.42),
    minaret(unit * 10.2, skyline * 0.95),
    `L${width} ${base - skyline * 0.32}`,
    `L${width} ${base} Z`,
  ].join(' ')
}

export const NightSkyline: React.FC<{ width: number; height: number; skyline: number; color: string; opacity: number; accent: string }> = ({ width, height, skyline, color, opacity, accent }) => (
  <g>
    <path d={skylinePath(width, height, skyline)} fill={color} opacity={opacity} />
    <line x1="0" y1={height - skyline * 0.32} x2={width} y2={height - skyline * 0.32} stroke={accent} strokeWidth="1" opacity="0.35" />
  </g>
)
