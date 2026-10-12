import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { Lantern } from './Lantern'
import { StarField } from './StarField'
import { seeded } from './seeded'

const lanterns = [
  { x: 0.08, rope: 0.15, size: 0.13 },
  { x: 0.2, rope: 0.03, size: 0.09 },
  { x: 0.8, rope: 0.12, size: 0.1 },
  { x: 0.93, rope: 0.22, size: 0.13 },
]

export const RamadanLanterns: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const unit = Math.min(width, height)

  return (
    <>
      <StarField color={palette.pattern} showMoon={false} />
      <div style={{ position: 'absolute', inset: 0, filter: `blur(${unit * 0.03}px)` }}>
        {Array.from({ length: 9 }, (_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: seeded(index, 41) * width,
              top: height * (0.55 + seeded(index, 42) * 0.4),
              width: unit * (0.08 + seeded(index, 43) * 0.1),
              height: unit * (0.08 + seeded(index, 43) * 0.1),
              borderRadius: '50%',
              background: withAlpha(palette.accent, 0.12 + 0.1 * Math.sin(seconds + index)),
            }}
          />
        ))}
      </div>
      {lanterns.map((lantern, index) => (
        <Lantern
          key={index}
          x={lantern.x * width}
          ropeLength={lantern.rope * height}
          size={lantern.size * unit}
          swingDeg={Math.sin(seconds * (0.7 + index * 0.13) + index * 1.7) * 4}
          glow={0.82 + 0.18 * Math.sin(seconds * 2.3 + index * 2)}
          metal="#b8893e"
          light={palette.accent}
        />
      ))}
    </>
  )
}
