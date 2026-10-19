import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { FilmGrain } from './FilmGrain'
import { seeded } from './seeded'

const orbCount = 16

export const VelvetBokeh: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const span = Math.min(width, height)

  return (
    <>
      {[0.3, 0.68].map((x, index) => (
        <div key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: width * x - span * 0.12, width: span * 0.24, opacity: 0.5 + 0.2 * Math.sin(seconds * 0.4 + index), background: `linear-gradient(180deg, ${withAlpha(palette.pattern, 0.1)}, transparent 70%)`, transform: `skewX(${index ? -8 : 8}deg)` }} />
      ))}
      {Array.from({ length: orbCount }, (_, index) => {
        const size = span * (0.12 + seeded(index, 41) * 0.38)
        const travel = height + size
        const y = height - ((seeded(index, 42) * travel + seconds * height * (0.008 + seeded(index, 43) * 0.012)) % travel)
        const x = width * seeded(index, 44) + Math.sin(seconds * 0.3 + index) * span * 0.04
        const color = index % 3 === 0 ? palette.accent : palette.pattern
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
              opacity: 0.1 + seeded(index, 45) * 0.22,
              background: `radial-gradient(circle, ${withAlpha(color, 0.75)} 0%, ${withAlpha(color, 0.35)} 45%, transparent 70%)`,
            }}
          />
        )
      })}
      <FilmGrain opacity={0.06} />
    </>
  )
}
