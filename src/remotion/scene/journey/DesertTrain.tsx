import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { SkyOrb } from './SkyOrb'
import { Train } from './Train'

export const DesertTrain: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorScale } = journeyLayout(width, height)
  const scale = actorScale * 0.75
  const trainLength = 210 * 5 * scale
  const loop = width + trainLength + width * 0.3
  const x = ((seconds * unit * 260) % loop) - width * 0.15

  return (
    <>
      <SkyOrb color="#ffe2a2" x={0.3} y={groundY / height - 0.18} size={0.08} halo={3} />
      <Hills color="#a0522d" baseY={groundY - height * 0.06} amplitude={height * 0.03} waves={1.3} offset={seconds * unit * 8} opacity={0.55} />
      <Hills color="#6e3417" baseY={groundY - height * 0.025} amplitude={height * 0.02} waves={2} offset={seconds * unit * 20} opacity={0.85} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0, background: 'linear-gradient(180deg, #3a1a0b, #1a0b05)' }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Train x={x} groundY={groundY + unit * 2} scale={scale} seconds={seconds} color="#1c0b04" window={palette.accent} cars={5} />
      </svg>
    </>
  )
}
