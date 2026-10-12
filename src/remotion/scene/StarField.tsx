import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { seeded } from './seeded'

const starCount = 70

export const StarField: React.FC<{ color: string; showMoon?: boolean }> = ({ color, showMoon = true }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const unit = Math.min(width, height) / 100
  const seconds = frame / fps
  const moonSize = unit * 12

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({ length: starCount }, (_, index) => {
        const size = unit * (0.15 + seeded(index, 8) * 0.45)
        const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(seconds * (0.6 + seeded(index, 9)) + index))
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: seeded(index, 10) * width,
              top: seeded(index, 11) * height * 0.75,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#fff',
              opacity: twinkle * 0.8,
              boxShadow: `0 0 ${size * 3}px #fff`,
            }}
          />
        )
      })}
      {showMoon && (
      <div
        style={{
          position: 'absolute',
          left: width * 0.06,
          top: height * 0.025 + Math.sin(seconds / 4) * unit,
          width: moonSize,
          height: moonSize,
          borderRadius: '50%',
          boxShadow: `inset ${moonSize * 0.22}px ${-moonSize * 0.08}px 0 0 ${color}`,
          filter: `drop-shadow(0 0 ${unit * 3}px ${color})`,
          opacity: 0.85,
        }}
      />
      )}
    </div>
  )
}
