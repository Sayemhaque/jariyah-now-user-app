import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { StarField } from '../StarField'
import { Car } from './Car'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { PassingProps } from './PassingProps'
import { Road } from './Road'
import { SkyOrb } from './SkyOrb'

export const NightDrive: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorX, actorScale } = journeyLayout(width, height)
  const speed = unit * 620

  return (
    <>
      <StarField color={palette.pattern} showMoon={false} />
      <SkyOrb color="#f4f1e6" x={0.22} y={0.2} size={0.045} halo={3.4} />
      <Hills color="#16213f" baseY={groundY - height * 0.06} amplitude={height * 0.035} waves={1.2} offset={seconds * speed * 0.03} opacity={0.9} />
      <Hills color="#0d1529" baseY={groundY - height * 0.02} amplitude={height * 0.02} waves={2.6} offset={seconds * speed * 0.12} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY - height * 0.16, height: height * 0.16, background: 'linear-gradient(180deg, transparent, rgba(255,190,120,.16) 70%, rgba(255,214,150,.26))' }} />
      <PassingProps kind="lamps" groundY={groundY} unit={unit * 0.8} seconds={seconds} speed={speed * 0.7} color="#070b16" glow="#ffd88a" />
      <Road groundY={groundY} unit={unit} seconds={seconds} speed={speed} surface="#080c18" line="#e8e2c8" />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Car x={actorX} groundY={groundY + unit * 6} scale={actorScale} seconds={seconds} color="#03050b" light="#ffe9b0" />
      </svg>
    </>
  )
}
