import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { MosqueSilhouette } from '../MosqueSilhouette'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { PassingProps } from './PassingProps'
import { Road } from './Road'
import { SkyOrb } from './SkyOrb'
import { Walker } from './Walker'

export const MasjidWalk: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorX, actorScale } = journeyLayout(width, height, 0.1)
  const speed = unit * 70

  return (
    <>
      <SkyOrb color="#fff0c8" x={0.78} y={0.22} size={0.04} halo={3.2} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY - height * 0.3, height: height * 0.3, background: `linear-gradient(180deg, transparent, ${withAlpha(palette.accent, 0.16)})` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: groundY - height * 0.012, opacity: 0.9 }}>
        <MosqueSilhouette color="#0b2421" light={palette.accent} />
      </div>
      <Hills color="#0a201d" baseY={groundY - height * 0.015} amplitude={height * 0.012} waves={2} offset={seconds * speed * 0.3} />
      <PassingProps kind="palms" groundY={groundY} unit={unit * 0.75} seconds={seconds} speed={speed * 0.8} color="#06140f" glow={palette.accent} />
      <Road groundY={groundY} unit={unit} seconds={seconds} speed={speed} surface="#05120f" line={palette.accent} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Walker x={actorX} groundY={groundY + unit * 2} scale={actorScale} seconds={seconds} color="#020806" />
      </svg>
    </>
  )
}
