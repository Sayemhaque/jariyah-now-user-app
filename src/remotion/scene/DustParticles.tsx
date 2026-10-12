import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { seeded } from './seeded'

const particleCount = 22

export const DustParticles: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const unit = Math.min(width, height) / 100
  const seconds = frame / fps

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: particleCount }, (_, index) => {
        const size = unit * (0.3 + seeded(index, 1) * 0.9)
        const travel = height * 1.2
        const rise = (seeded(index, 3) * travel + seconds * height * (0.01 + seeded(index, 2) * 0.018)) % travel
        const sway = Math.sin(seconds / (2 + seeded(index, 4) * 3) + index) * unit * 2.5
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(seconds / (1.4 + seeded(index, 5) * 2) + index))
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: seeded(index, 6) * width + sway,
              top: height * 1.1 - rise,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity: (0.1 + 0.3 * seeded(index, 7)) * twinkle,
              boxShadow: `0 0 ${size * 4}px ${color}`,
            }}
          />
        )
      })}
    </div>
  )
}
