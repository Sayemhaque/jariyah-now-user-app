import React from 'react'
import { useVideoConfig } from 'remotion'
import { seeded } from '../seeded'

export const RainStreaks: React.FC<{ seconds: number; color: string; count?: number }> = ({ seconds, color, count = 90 }) => {
  const { width, height } = useVideoConfig()
  const unit = Math.min(width, height) / 1080
  const length = unit * 46
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        const speed = height * (0.9 + seeded(i, 81) * 0.6)
        const y = ((seeded(i, 82) * height + seconds * speed) % (height + length)) - length
        const x = width * seeded(i, 83) - (y / height) * width * 0.08
        return <line key={i} x1={x} y1={y} x2={x - length * 0.18} y2={y + length} stroke={color} strokeWidth={unit * (1.2 + seeded(i, 84) * 1.4)} strokeLinecap="round" opacity={0.25 + seeded(i, 85) * 0.35} />
      })}
    </svg>
  )
}
