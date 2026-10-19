import React from 'react'

interface SoundRingsProps {
  cx: number
  cy: number
  side: 1 | -1
  level: number
  seconds: number
  accent: string
  base: number
}

export const SoundRings: React.FC<SoundRingsProps> = ({ cx, cy, side, level, seconds, accent, base }) => (
  <>
    {[0, 1, 2].map((ring) => {
      const progress = (seconds * 0.9 + ring / 3) % 1
      const radius = base + progress * base * 1.6
      const sweep = side === 1 ? 1 : 0
      const opacity = (1 - progress) * Math.min(1, 0.25 + level * 1.4)
      return (
        <path
          key={ring}
          d={`M${cx + side * radius * 0.5},${cy - radius * 0.86} A${radius},${radius} 0 0 ${sweep} ${cx + side * radius * 0.5},${cy + radius * 0.86}`}
          fill="none"
          stroke={accent}
          strokeWidth={3.5}
          strokeLinecap="round"
          opacity={opacity}
        />
      )
    })}
  </>
)
