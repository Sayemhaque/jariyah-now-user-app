import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'

const lightCount = 16
const seeded = (index: number, salt: number) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

export const AmbientLights: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const unit = Math.min(width, height) / 100

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: lightCount }, (_, index) => {
        const size = unit * (0.4 + seeded(index, 1) * 1.1)
        const speed = height * (0.012 + seeded(index, 2) * 0.02)
        const y = (seeded(index, 3) * height * 1.2 - (frame / fps) * speed) % (height * 1.2)
        const sway = Math.sin(frame / fps / (2 + seeded(index, 4) * 3) + index) * unit * 2
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(frame / fps / (1.5 + seeded(index, 5) * 2) + index))
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: seeded(index, 6) * width + sway,
              top: y < 0 ? y + height * 1.2 : y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity: 0.12 + 0.28 * twinkle * seeded(index, 7),
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        )
      })}
    </div>
  )
}
