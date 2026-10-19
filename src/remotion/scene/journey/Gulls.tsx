import React from 'react'
import { useVideoConfig } from 'remotion'
import { seeded } from '../seeded'

export const Gulls: React.FC<{ seconds: number; color: string; count?: number; top: number; bottom: number }> = ({ seconds, color, count = 5, top, bottom }) => {
  const { width, height } = useVideoConfig()
  const unit = Math.min(width, height) / 1080
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        const span = width * 1.3
        const x = ((seeded(i, 61) * span + seconds * unit * (40 + seeded(i, 62) * 30)) % span) - width * 0.15
        const y = height * (top + seeded(i, 63) * (bottom - top)) + Math.sin(seconds * 0.8 + i) * unit * 12
        const size = unit * (14 + seeded(i, 64) * 12)
        const flap = Math.sin(seconds * (6 + i) + i) * 0.6
        return (
          <path key={i} d={`M${x - size},${y - flap * size * 0.6} Q${x - size * 0.4},${y - size * 0.5} ${x},${y} Q${x + size * 0.4},${y - size * 0.5} ${x + size},${y - flap * size * 0.6}`}
            fill="none" stroke={color} strokeWidth={unit * 3} strokeLinecap="round" />
        )
      })}
    </svg>
  )
}
