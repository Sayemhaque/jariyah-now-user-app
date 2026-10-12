import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { SoftClouds } from './SoftClouds'

export const HeavenlyLight: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const size = Math.max(width, height) * 2.2
  const ray = withAlpha('#fff3d6', 0.14)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - size / 2,
          top: -size / 2 - height * 0.08,
          width: size,
          height: size,
          background: `repeating-conic-gradient(from ${170 + Math.sin(seconds * 0.2) * 6}deg, ${ray} 0deg 3deg, transparent 3deg 9deg)`,
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 30%, transparent 55%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 30%, transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width / 2 - width * 0.6,
          top: -height * 0.18,
          width: width * 1.2,
          height: height * 0.4,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${withAlpha('#fff6e0', 0.55)} 0%, ${withAlpha(palette.accent, 0.12)} 50%, transparent 72%)`,
        }}
      />
      <SoftClouds color="#ffffff" top={0.02} bottom={0.3} opacity={0.55} count={8} />
      <SoftClouds color="#d8e4ff" top={0.7} bottom={0.95} opacity={0.3} count={5} />
    </>
  )
}
