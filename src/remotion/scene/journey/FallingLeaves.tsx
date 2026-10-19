import React from 'react'
import { useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { seeded } from '../seeded'

export const FallingLeaves: React.FC<{ seconds: number; leaf: string; firefly: string; fromX: number; toX: number; groundY: number }> = ({ seconds, leaf, firefly, fromX, toX, groundY }) => {
  const { width, height } = useVideoConfig()
  const unit = Math.min(width, height) / 1080
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const fall = groundY * 0.5
        const t = (seconds * (0.05 + seeded(i, 71) * 0.04) + seeded(i, 72)) % 1
        const x = width * (fromX + seeded(i, 73) * (toX - fromX)) + Math.sin(t * 9 + i) * unit * 40
        const y = groundY - fall + t * fall
        return <ellipse key={`l${i}`} cx={x} cy={y} rx={unit * 9} ry={unit * 4} fill={leaf} opacity={0.8 * (1 - t * 0.6)} transform={`rotate(${t * 720 + i * 40} ${x} ${y})`} />
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const x = width * seeded(i, 74) + Math.sin(seconds * 0.5 + i) * unit * 30
        const y = groundY - height * (0.04 + seeded(i, 75) * 0.22) + Math.cos(seconds * 0.4 + i) * unit * 20
        const glow = 0.3 + 0.7 * Math.abs(Math.sin(seconds * (1 + seeded(i, 76)) + i))
        return <circle key={`f${i}`} cx={x} cy={y} r={unit * 10} fill={withAlpha(firefly, 0.2 * glow)} stroke={firefly} strokeWidth={unit * 3} strokeOpacity={glow} />
      })}
    </svg>
  )
}
