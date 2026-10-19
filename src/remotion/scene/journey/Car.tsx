import React from 'react'
import { withAlpha } from '@/lib/color'

interface CarProps {
  x: number
  groundY: number
  scale: number
  seconds: number
  color: string
  light: string
}

const body = 'M-112,-22 L-112,-40 Q-108,-50 -92,-52 L-56,-54 Q-34,-82 6,-84 L38,-84 Q64,-82 84,-56 L106,-50 Q114,-46 114,-36 L114,-22 Z'
const windows = 'M-46,-56 Q-28,-76 4,-77 L4,-56 Z M12,-77 L34,-77 Q54,-75 70,-56 L12,-56 Z'

const CarWheel: React.FC<{ cx: number; spin: number; color: string }> = ({ cx, spin, color }) => (
  <g transform={`translate(${cx} -20) rotate(${spin})`}>
    <circle r={20} fill={color} />
    <circle r={11} fill="none" stroke="#9aa3b5" strokeWidth={2} opacity={0.6} />
    <line x1={-11} y1={0} x2={11} y2={0} stroke="#9aa3b5" strokeWidth={2} opacity={0.5} />
    <line x1={0} y1={-11} x2={0} y2={11} stroke="#9aa3b5" strokeWidth={2} opacity={0.5} />
  </g>
)

export const Car: React.FC<CarProps> = ({ x, groundY, scale, seconds, color, light }) => {
  const spin = (seconds * 900) % 360
  const bounce = Math.sin(seconds * 9) * 0.7
  return (
    <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
      <defs>
        <linearGradient id="car-beam" x1="0" x2="1">
          <stop offset="0" stopColor={light} stopOpacity="0.55" />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="112,-38 520,-4 520,-86" fill="url(#car-beam)" />
      <g transform={`translate(0 ${bounce})`}>
        <path d={body} fill={color} stroke="#5b6f9e" strokeWidth={2.5} strokeOpacity={0.9} />
        <path d={windows} fill={withAlpha(light, 0.22)} />
        <rect x={104} y={-44} width={10} height={7} rx={2} fill={light} />
        <rect x={-114} y={-44} width={8} height={8} rx={2} fill="#ff4d4d" />
      </g>
      <CarWheel cx={-66} spin={spin} color={color} />
      <CarWheel cx={70} spin={spin} color={color} />
    </g>
  )
}
