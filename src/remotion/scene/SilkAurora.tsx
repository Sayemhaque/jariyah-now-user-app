import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { FilmGrain } from './FilmGrain'

const blobs = [
  { color: '#0f8f7a', x: 0.2, y: 0.25, speed: 0.11, phase: 0, size: 1.1 },
  { color: '#1f6fa8', x: 0.8, y: 0.35, speed: 0.08, phase: 2, size: 1.0 },
  { color: '#d4a24c', x: 0.6, y: 0.75, speed: 0.1, phase: 4, size: 0.85 },
  { color: '#3fd0b0', x: 0.3, y: 0.6, speed: 0.07, phase: 1, size: 0.9 },
  { color: '#123f5c', x: 0.7, y: 0.1, speed: 0.09, phase: 3, size: 0.8 },
]

export const SilkAurora: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const span = Math.max(width, height)

  return (
    <>
      {blobs.map((blob, index) => {
        const size = span * blob.size
        const x = width * (blob.x + 0.18 * Math.sin(seconds * blob.speed + blob.phase))
        const y = height * (blob.y + 0.12 * Math.cos(seconds * blob.speed * 1.3 + blob.phase))
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(blob.color, 0.34)} 0%, ${withAlpha(blob.color, 0.1)} 35%, transparent 62%)`,
              mixBlendMode: 'screen',
            }}
          />
        )
      })}
      <FilmGrain opacity={0.07} />
    </>
  )
}
