import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { seeded } from './seeded'

const orbCount = 18

export const GoldenBokeh: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const unit = Math.min(width, height) / 100
  const sweep = ((seconds * 0.06) % 1.6) - 0.3

  return (
    <>
      {Array.from({ length: orbCount }, (_, index) => {
        const size = unit * (8 + seeded(index, 51) * 22)
        const depth = seeded(index, 52)
        const x = seeded(index, 53) * width + Math.sin(seconds * 0.15 + index) * unit * 6
        const y = seeded(index, 54) * height + Math.cos(seconds * 0.12 + index * 2) * unit * 5
        const tone = index % 3 === 0 ? '#ffb46b' : palette.accent
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
              background: `radial-gradient(circle, ${withAlpha(tone, 0.32)} 0%, ${withAlpha(tone, 0.18)} 55%, ${withAlpha(tone, 0.04)} 70%, transparent 72%)`,
              filter: `blur(${unit * (0.3 + depth * 1.6)}px)`,
              opacity: 0.55 + 0.45 * Math.abs(Math.sin(seconds * 0.4 + index)),
            }}
          />
        )
      })}
      <div
        style={{
          position: 'absolute',
          left: `${sweep * 100}%`,
          top: -height * 0.2,
          width: width * 0.35,
          height: height * 1.4,
          background: `linear-gradient(90deg, transparent, ${withAlpha(palette.accent, 0.08)}, transparent)`,
          transform: 'rotate(18deg)',
        }}
      />
    </>
  )
}
