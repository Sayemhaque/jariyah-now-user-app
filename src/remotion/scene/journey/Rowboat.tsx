import React from 'react'
import { withAlpha } from '@/lib/color'

export const Rowboat: React.FC<{ x: number; waterY: number; scale: number; seconds: number; color: string; lantern: string }> = ({ x, waterY, scale, seconds, color, lantern }) => {
  const bob = Math.sin(seconds * 1.2) * 3
  const flicker = 0.8 + 0.2 * Math.sin(seconds * 9) * Math.sin(seconds * 3.3)
  return (
    <g transform={`translate(${x} ${waterY + bob}) scale(${scale})`}>
      <ellipse cx={58} cy={30} rx={40} ry={8} fill={withAlpha(lantern, 0.25 * flicker)} />
      <circle cx={30} cy={-100} r={120} fill={withAlpha(lantern, 0.26 * flicker)} />
      <path d="M-90,-14 L90,-14 Q74,12 44,16 L-50,16 Q-78,10 -90,-14 Z" fill={color} />
      <path d="M-34,-14 Q-38,-52 -20,-68 L-2,-68 Q8,-50 6,-14 Z" fill={color} stroke={lantern} strokeWidth={2} strokeOpacity={0.55} />
      <circle cx={-11} cy={-84} r={12} fill={color} stroke={lantern} strokeWidth={2} strokeOpacity={0.55} />
      <path d="M-23,-88 A12,12 0 0 1 1,-88 Z" fill={color} />
      <polyline points="0,-60 30,-80 52,-100" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={58} y1={-108} x2={52} y2={-100} stroke={color} strokeWidth={3} />
      <rect x={48} y={-136} width={20} height={26} rx={5} fill={lantern} opacity={flicker} />
      <path d="M46,-136 L58,-146 L70,-136 Z" fill={color} />
    </g>
  )
}
