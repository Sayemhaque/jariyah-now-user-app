import React from 'react'
import { useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { worldOffset } from './journeyLayout'

type PropKind = 'trees' | 'lamps' | 'palms'

interface PassingPropsProps {
  kind: PropKind
  groundY: number
  unit: number
  seconds: number
  speed: number
  color: string
  glow: string
}

const drawProp = (kind: PropKind, x: number, y: number, u: number, color: string, glow: string) => {
  if (kind === 'lamps') {
    return (
      <g key={x}>
        <circle cx={x + u * 34} cy={y - u * 300} r={u * 60} fill={withAlpha(glow, 0.18)} />
        <rect x={x - u * 3} y={y - u * 300} width={u * 6} height={u * 300} fill={color} />
        <path d={`M${x},${y - u * 296} q${u * 20},${-u * 14} ${u * 36},${-u * 2}`} stroke={color} strokeWidth={u * 5} fill="none" />
        <circle cx={x + u * 36} cy={y - u * 292} r={u * 7} fill={glow} />
      </g>
    )
  }
  if (kind === 'palms') {
    const top = y - u * 260
    return (
      <g key={x} stroke={color} strokeLinecap="round" fill="none">
        <path d={`M${x},${y} q${u * 14},${-u * 130} ${-u * 6},${-u * 260}`} strokeWidth={u * 9} />
        {[-2.6, -2.1, -1.5, -1, -0.5].map((a) => (
          <path key={a} d={`M${x - u * 6},${top} q${Math.cos(a) * u * 60},${Math.sin(a) * u * 60 - u * 10} ${Math.cos(a) * u * 110},${Math.sin(a) * u * 110 + u * 40}`} strokeWidth={u * 6} />
        ))}
      </g>
    )
  }
  return (
    <g key={x} fill={color}>
      <rect x={x - u * 5} y={y - u * 120} width={u * 10} height={u * 120} />
      <circle cx={x} cy={y - u * 170} r={u * 62} />
      <circle cx={x - u * 42} cy={y - u * 130} r={u * 44} />
      <circle cx={x + u * 44} cy={y - u * 136} r={u * 46} />
    </g>
  )
}

export const PassingProps: React.FC<PassingPropsProps> = ({ kind, groundY, unit, seconds, speed, color, glow }) => {
  const { width, height } = useVideoConfig()
  const spacing = unit * (kind === 'lamps' ? 420 : 360)
  const offset = worldOffset(seconds, speed, spacing)
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: Math.ceil(width / spacing) + 2 }, (_, i) => drawProp(kind, i * spacing - offset, groundY, unit, color, glow))}
    </svg>
  )
}
