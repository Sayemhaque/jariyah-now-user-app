import React from 'react'

interface CamelProps {
  x: number
  groundY: number
  scale: number
  seconds: number
  phase: number
  color: string
}

const body = 'M-70,-118 Q-60,-150 -30,-148 Q-15,-176 8,-150 Q28,-150 40,-128 L52,-150 Q58,-176 70,-188 L86,-190 Q96,-186 92,-178 L78,-174 Q70,-150 66,-118 Q60,-96 40,-92 L-48,-92 Q-72,-96 -70,-118 Z'

export const Camel: React.FC<CamelProps> = ({ x, groundY, scale, seconds, phase, color }) => {
  const step = seconds * 3.4 + phase
  const leg = (hipX: number, offset: number, opacity: number) => {
    const swing = Math.sin(step + offset) * 0.38
    const knee = [hipX + Math.sin(swing) * 26, -60]
    const foot = [knee[0]! + Math.sin(swing * 1.4) * 28, 0]
    return <polyline points={`${hipX},-96 ${knee[0]},${knee[1]} ${foot[0]},${foot[1]}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
  }
  const bob = Math.abs(Math.sin(step)) * -3
  return (
    <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
      {leg(-40, Math.PI, 0.7)}
      {leg(34, 0, 0.7)}
      <g transform={`translate(0 ${bob})`}>
        <path d={body} fill={color} />
        <path d="M-60,-120 Q-82,-110 -86,-90" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
        <path d="M-22,-150 Q-14,-186 2,-188 Q14,-186 14,-160 L10,-148 L-20,-148 Z" fill={color} />
        <circle cx={-2} cy={-200} r={12} fill={color} />
        <path d="M-14,-204 Q-2,-218 12,-204 Q14,-196 18,-190 L-12,-196 Z" fill={color} />
      </g>
      {leg(-28, 0, 1)}
      {leg(46, Math.PI, 1)}
    </g>
  )
}
