import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { Gulls } from './Gulls'
import { journeyLayout } from './journeyLayout'
import { SailBoat } from './SailBoat'
import { SeaWaves } from './SeaWaves'
import { SkyOrb } from './SkyOrb'

export const SunsetSail: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { groundY, actorX, actorScale } = journeyLayout(width, height, 0.34)
  const horizonY = groundY - height * (height > width ? 0.07 : 0.16)

  return (
    <>
      <SkyOrb color="#ffe0a6" x={0.62} y={horizonY / height - 0.02} size={0.1} halo={3} />
      <SeaWaves horizonY={horizonY} seconds={seconds} colors={['#7a3a55', '#3b1b38', '#1c0c1c']} glint="#ffd59a" glintX={0.62} />
      <Gulls seconds={seconds} color="#2a1226" top={0.42} bottom={0.6} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <SailBoat x={actorX} waterY={groundY} scale={actorScale * 0.9} seconds={seconds} color="#12060f" sail="#4a1d3c" />
      </svg>
    </>
  )
}
