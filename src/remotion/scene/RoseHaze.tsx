import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { SoftClouds } from './SoftClouds'

export const RoseHaze: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const sun = Math.min(width, height) * 0.9
  const rise = Math.sin(seconds * 0.15) * height * 0.01

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 55%, ${withAlpha('#ff9e7a', 0.24)} 82%, ${withAlpha('#ffcf9e', 0.35)} 100%)` }} />
      <div
        style={{
          position: 'absolute',
          left: width / 2 - sun / 2,
          top: height * 0.82 - sun / 2 + rise,
          width: sun,
          height: sun,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withAlpha('#fff1dc', 0.7)} 0%, ${withAlpha(palette.accent, 0.38)} 18%, ${withAlpha('#ff8f78', 0.18)} 40%, transparent 68%)`,
        }}
      />
      <SoftClouds color="#ffe4d6" top={0.62} bottom={0.92} opacity={0.3} count={7} />
      <SoftClouds color="#f2c9e0" top={0.05} bottom={0.35} opacity={0.22} count={6} />
    </>
  )
}
