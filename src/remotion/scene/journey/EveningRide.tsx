import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { Cyclist } from './Cyclist'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { PassingProps } from './PassingProps'
import { Road } from './Road'
import { SkyOrb } from './SkyOrb'

export const EveningRide: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorX, actorScale } = journeyLayout(width, height)
  const speed = unit * 240

  return (
    <>
      <SkyOrb color="#ffd9a0" x={0.7} y={(groundY / height) - 0.16} size={0.09} halo={3} />
      <Hills color="#5a2c4a" baseY={groundY - height * 0.07} amplitude={height * 0.04} waves={1.4} offset={seconds * speed * 0.08} opacity={0.75} />
      <Hills color="#3a1a33" baseY={groundY - height * 0.03} amplitude={height * 0.03} waves={2.2} offset={seconds * speed * 0.2} />
      <PassingProps kind="trees" groundY={groundY} unit={unit * 0.8} seconds={seconds} speed={speed * 0.55} color="#24101f" glow={palette.accent} />
      <Road groundY={groundY} unit={unit} seconds={seconds} speed={speed} surface="#1a0c16" line={palette.accent} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Cyclist x={actorX} groundY={groundY + unit * 4} scale={actorScale} seconds={seconds} color="#0d0509" />
      </svg>
    </>
  )
}
