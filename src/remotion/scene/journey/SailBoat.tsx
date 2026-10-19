import React from 'react'

interface SailBoatProps {
  x: number
  waterY: number
  scale: number
  seconds: number
  color: string
  sail: string
}

export const SailBoat: React.FC<SailBoatProps> = ({ x, waterY, scale, seconds, color, sail }) => {
  const tilt = Math.sin(seconds * 1.3) * 4
  const bob = Math.sin(seconds * 1.9) * 4
  return (
    <g transform={`translate(${x} ${waterY + bob}) scale(${scale}) rotate(${tilt})`}>
      <path d="M-95,-18 L95,-18 Q78,10 50,14 L-56,14 Q-82,8 -95,-18 Z" fill={color} />
      <line x1={-93} y1={-18} x2={93} y2={-18} stroke="#ffd59a" strokeWidth={3} strokeOpacity={0.6} />
      <rect x={-3} y={-200} width={6} height={184} fill={color} />
      <path d="M6,-196 Q70,-120 84,-30 L6,-30 Z" fill={sail} />
      <path d="M-6,-170 Q-58,-100 -70,-34 L-6,-34 Z" fill={sail} opacity={0.85} />
      <path d="M2,-206 l22,6 l-22,6 Z" fill={color} />
      <circle cx={-40} cy={-46} r={10} fill={color} />
      <path d="M-50,-36 Q-40,-42 -30,-36 L-28,-18 L-52,-18 Z" fill={color} />
    </g>
  )
}
