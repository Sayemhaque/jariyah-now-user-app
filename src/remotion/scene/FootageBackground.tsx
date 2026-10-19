import React from 'react'
import { interpolate, Loop, OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'

export const FootageBackground: React.FC<{ src: string; seconds: number; palette: ScenePalette }> = ({ src, seconds, palette }) => {
  const frame = useCurrentFrame()
  const { durationInFrames, fps } = useVideoConfig()
  const zoom = interpolate(frame, [0, Math.max(1, durationInFrames)], [1.04, 1.12], { extrapolateRight: 'clamp' })
  const [top, middle, bottom] = palette.base

  return (
    <>
      <Loop durationInFrames={Math.max(1, Math.floor(seconds * fps))}>
        <OffthreadVideo src={src} muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
      </Loop>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${withAlpha(top, 0.55)} 0%, ${withAlpha(middle, 0.42)} 40%, ${withAlpha(middle, 0.5)} 65%, ${withAlpha(bottom, 0.82)} 100%)`,
        }}
      />
    </>
  )
}
