import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { StarField } from '../StarField'
import { Camel } from './Camel'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { SkyOrb } from './SkyOrb'

export const DesertCaravan: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorX, actorScale } = journeyLayout(width, height, 0.62)
  const portrait = height > width
  const speed = unit * 50
  const gap = unit * (portrait ? 210 : 230)

  return (
    <>
      <StarField color={palette.pattern} showMoon={false} />
      <SkyOrb color="#fdf3dc" x={0.25} y={0.24} size={0.05} halo={3.4} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY - height * 0.2, height: height * 0.2, background: 'linear-gradient(180deg, transparent, rgba(140,160,230,.32))' }} />
      <Hills color="#3b3472" baseY={groundY - height * 0.05} amplitude={height * 0.035} waves={1.1} offset={seconds * speed * 0.2} opacity={0.85} />
      <Hills color="#262056" baseY={groundY - height * 0.015} amplitude={height * 0.02} waves={1.8} offset={seconds * speed * 0.5} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0, background: '#0b0920' }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {[0, 1, 2].map((i) => (
          <Camel key={i} x={actorX - i * gap} groundY={groundY + unit * 2} scale={actorScale * (1 - i * 0.12)} seconds={seconds} phase={i * 1.3} color="#050413" />
        ))}
      </svg>
    </>
  )
}
