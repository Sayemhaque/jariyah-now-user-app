import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { BigTree } from './BigTree'
import { FallingLeaves } from './FallingLeaves'
import { Hills } from './Hills'
import { journeyLayout } from './journeyLayout'
import { Reader } from './Reader'
import { SkyOrb } from './SkyOrb'

export const TreeReading: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const { unit, groundY, actorScale } = journeyLayout(width, height)
  const portrait = height > width
  const treeX = width * (portrait ? 0.3 : 0.16)

  return (
    <>
      <SkyOrb color="#fff3d2" x={0.78} y={groundY / height - 0.12} size={0.07} halo={3.2} />
      <Hills color="#4f6a5a" baseY={groundY - height * 0.05} amplitude={height * 0.025} waves={1.2} offset={seconds * unit * 4} opacity={0.5} />
      <Hills color="#22382d" baseY={groundY - height * 0.015} amplitude={height * 0.012} waves={2.2} offset={seconds * unit * 8} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0, background: '#0d1a14' }} />
      <BigTree x={treeX} groundY={groundY + unit * 4} scale={actorScale * (portrait ? 0.95 : 0.85)} seconds={seconds} color="#07110c" />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <Reader x={treeX + width * (portrait ? 0.2 : 0.09)} groundY={groundY + unit * 4} scale={actorScale} seconds={seconds} color="#040a07" page={palette.accent} />
      </svg>
      <FallingLeaves seconds={seconds} leaf="#3b5a3f" firefly={palette.accent} fromX={portrait ? 0.1 : 0.05} toX={portrait ? 0.55 : 0.3} groundY={groundY} />
    </>
  )
}
