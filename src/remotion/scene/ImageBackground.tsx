import React from 'react'
import { Img, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'

export const ImageBackground: React.FC<{ src: string; palette: ScenePalette }> = ({ src, palette }) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const zoom = interpolate(frame, [0, Math.max(1, durationInFrames)], [1, 1.1], { extrapolateRight: 'clamp' })

  return (
    <>
      <Img
        src={src}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${withAlpha(palette.base[1], 0.55)} 0%, ${withAlpha(palette.base[2], 0.35)} 45%, ${withAlpha(palette.base[2], 0.8)} 100%)`,
        }}
      />
    </>
  )
}
