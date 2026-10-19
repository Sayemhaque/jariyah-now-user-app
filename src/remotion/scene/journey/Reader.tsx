import React from 'react'

interface ReaderProps {
  x: number
  groundY: number
  scale: number
  seconds: number
  color: string
  page: string
}

export const Reader: React.FC<ReaderProps> = ({ x, groundY, scale, seconds, color, page }) => {
  const sway = Math.sin(seconds * 1.6) * 3
  return (
    <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
      <path d="M-58,0 Q-60,-26 -36,-30 L30,-30 Q46,-28 46,-12 L46,0 Z" fill={color} />
      <g transform={`rotate(${sway} -10 -30)`}>
        <path d="M-34,-30 Q-40,-80 -20,-104 L4,-104 Q16,-80 14,-30 Z" fill={color} />
        <circle cx={-8} cy={-122} r={14} fill={color} />
        <path d="M-22,-126 A14,14 0 0 1 6,-126 Z" fill={color} />
        <polyline points="2,-96 28,-70 50,-62" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M44,0 L70,-46 M70,0 L44,-46" stroke={color} strokeWidth={5} strokeLinecap="round" />
      <path d="M40,-50 Q57,-60 57,-50 Q57,-60 74,-50 L74,-44 Q57,-52 57,-44 Q57,-52 40,-44 Z" fill={page} />
    </g>
  )
}
