import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { journeyLayout } from './journeyLayout'
import { RainStreaks } from './RainStreaks'
import { Road } from './Road'
import { Skyline } from './Skyline'
import { UmbrellaWalker } from './UmbrellaWalker'

export const RainyEvening: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorX, actorScale } = journeyLayout(width, height, 0.42)
  const portrait = height > width

  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY - height * 0.25, height: height * 0.25, background: 'linear-gradient(180deg, transparent, rgba(255,170,110,.3))' }} />
      <Skyline groundY={groundY} color="#1f2a46" window="#ffd28a" seconds={seconds} heightScale={portrait ? 0.22 : 0.42} />
      <Road groundY={groundY} unit={unit} seconds={seconds} speed={unit * 70} surface="#0a0f1c" line="#ffcf8a" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0, background: 'linear-gradient(180deg, rgba(255,207,138,.10), transparent 60%)' }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <UmbrellaWalker x={actorX} groundY={groundY + unit * 2} scale={actorScale} seconds={seconds} color="#03050a" />
      </svg>
      <RainStreaks seconds={seconds} color={palette.pattern} />
    </>
  )
}
