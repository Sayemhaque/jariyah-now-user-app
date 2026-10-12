import React from 'react'
import { useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { ArchFrame } from './ArchFrame'
import { GlowingMoon } from './GlowingMoon'
import { SoftClouds } from './SoftClouds'
import { StarField } from './StarField'

export const MoonlitArch: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const { width, height } = useVideoConfig()
  return (
    <>
      <StarField color={palette.pattern} showMoon={false} />
      <GlowingMoon x={width * 0.5} y={height * 0.97} size={Math.min(width, height) * 0.5} color="#e9dcbc" />
      <SoftClouds color="#c9d4ff" top={0.6} bottom={0.85} opacity={0.3} count={5} />
      <svg viewBox="0 0 1000 120" preserveAspectRatio="none" width={width} height={height * 0.15} style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <path d="M0,120 L0,60 Q150,20 300,55 Q450,85 600,40 Q800,0 1000,50 L1000,120 Z" fill="#070b16" />
      </svg>
      <ArchFrame color="#070b16" trim={palette.accent} />
    </>
  )
}
