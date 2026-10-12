import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { seeded } from './seeded'

const starCount = 140

export const MilkyWay: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const unit = Math.min(width, height) / 100
  const band = Math.hypot(width, height)

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - band / 2,
          top: height * 0.32 - unit * 14,
          width: band,
          height: unit * 28,
          transform: `rotate(-32deg)`,
          background: 'radial-gradient(ellipse at center, rgba(225,215,255,0.5) 0%, rgba(160,140,235,0.22) 40%, transparent 70%)',
          filter: `blur(${unit * 3}px)`,
        }}
      />
      {Array.from({ length: starCount }, (_, index) => {
        const alongBand = index % 2 === 0
        const t = seeded(index, 61)
        const offset = (seeded(index, 62) - 0.5) * (alongBand ? 0.18 : 1.2)
        const x = alongBand ? width * (t * 1.2 - 0.1) : seeded(index, 63) * width
        const y = alongBand ? height * (0.32 + (0.5 - t) * 0.75 * (width / height) * 0.6 + offset * 0.5) : seeded(index, 64) * height * 0.7
        const size = unit * (0.12 + seeded(index, 65) * 0.35)
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#fff',
              opacity: 0.35 + 0.65 * Math.abs(Math.sin(seconds * (0.5 + seeded(index, 66)) + index)),
            }}
          />
        )
      })}
    </div>
  )
}
