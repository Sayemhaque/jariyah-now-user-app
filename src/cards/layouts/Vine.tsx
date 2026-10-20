import React from 'react'

const leaves: [number, number, number][] = [
  [70, 250, -60], [120, 200, -30], [150, 140, -70], [210, 110, -20], [260, 70, -50], [330, 52, -10], [96, 330, -80], [400, 40, 5],
]

export const Vine: React.FC<{ color: string; x: number; y: number; scale: number }> = ({ color, x, y, scale }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity="0.75">
    <path d="M30 420 C60 300 120 180 220 110 S380 40 460 36" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M60 330 C110 300 150 250 170 200" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {leaves.map(([lx, ly, angle], i) => (
      <ellipse key={i} cx={lx} cy={ly} rx="26" ry="10" transform={`rotate(${angle} ${lx} ${ly})`} fill={i % 2 ? color : 'none'} stroke={color} strokeWidth="1.6" fillOpacity="0.55" />
    ))}
    <circle cx="460" cy="36" r="6" fill={color} />
    <circle cx="186" cy="180" r="4" fill={color} />
  </g>
)
