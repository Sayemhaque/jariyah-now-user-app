import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { StarField } from '../StarField'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { Rowboat } from './Rowboat'
import { SeaWaves } from './SeaWaves'
import { SkyOrb } from './SkyOrb'

export const LanternLake: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { groundY, actorX, actorScale } = journeyLayout(width, height, 0.45)
  const horizonY = groundY - height * (height > width ? 0.07 : 0.16)

  return (
    <>
      <StarField color={palette.pattern} showMoon={false} />
      <SkyOrb color="#f7f2e2" x={0.72} y={0.22} size={0.05} halo={3.4} />
      <Hills color="#0e1a33" baseY={horizonY} amplitude={height * 0.04} waves={1.3} offset={seconds * 2} />
      <SeaWaves horizonY={horizonY} seconds={seconds * 0.4} colors={['#13223f', '#0c1730', '#060c1c']} glint="#f2ead2" glintX={0.72} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Rowboat x={actorX} waterY={groundY} scale={actorScale} seconds={seconds} color="#02050c" lantern={palette.accent} />
      </svg>
    </>
  )
}
