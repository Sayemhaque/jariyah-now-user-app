import React from 'react'
import { useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'

export const SkyOrb: React.FC<{ color: string; x: number; y: number; size: number; halo: number }> = ({ color, x, y, size, halo }) => {
  const { width, height } = useVideoConfig()
  const radius = Math.min(width, height) * size
  return (
    <div
      style={{
        position: 'absolute',
        left: width * x - radius * halo,
        top: height * y - radius * halo,
        width: radius * halo * 2,
        height: radius * halo * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, ${color} ${100 / halo / 2}%, ${withAlpha(color, 0.35)} ${100 / halo / 2 + 4}%, transparent 70%)`,
      }}
    />
  )
}
