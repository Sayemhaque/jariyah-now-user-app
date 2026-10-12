import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { seeded } from './seeded'

interface SoftCloudsProps {
  color: string
  count?: number
  top: number
  bottom: number
  opacity?: number
}

export const SoftClouds: React.FC<SoftCloudsProps> = ({ color, count = 7, top, bottom, opacity = 0.45 }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const unit = Math.min(width, height) / 100

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', filter: `blur(${unit * 2.2}px)` }}>
      {Array.from({ length: count }, (_, index) => {
        const cloudWidth = width * (0.45 + seeded(index, 21) * 0.5)
        const span = width + cloudWidth
        const x = ((seeded(index, 22) * span + seconds * width * (0.006 + seeded(index, 23) * 0.008)) % span) - cloudWidth
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: height * (top + seeded(index, 24) * (bottom - top)),
              width: cloudWidth,
              height: cloudWidth * (0.16 + seeded(index, 25) * 0.1),
              borderRadius: '50%',
              background: `radial-gradient(ellipse at center, ${withAlpha(color, opacity)} 0%, ${withAlpha(color, opacity * 0.4)} 45%, transparent 72%)`,
            }}
          />
        )
      })}
    </div>
  )
}
