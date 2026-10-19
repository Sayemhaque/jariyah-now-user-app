import React from 'react'
import { useVideoConfig } from 'remotion'
import { Hills } from './Hills'

interface SeaWavesProps {
  horizonY: number
  seconds: number
  colors: [string, string, string]
  glint: string
  glintX: number
}

export const SeaWaves: React.FC<SeaWavesProps> = ({ horizonY, seconds, colors, glint, glintX }) => {
  const { width, height } = useVideoConfig()
  const depth = height - horizonY
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: horizonY, bottom: 0, background: `linear-gradient(180deg, ${colors[0]}, ${colors[2]})` }} />
      {Array.from({ length: 14 }, (_, i) => {
        const y = horizonY + depth * (0.04 + (i / 14) * 0.6)
        const shimmer = 0.25 + 0.75 * Math.abs(Math.sin(seconds * 2.2 + i * 1.7))
        const span = width * (0.04 + (i / 14) * 0.16)
        return <div key={i} style={{ position: 'absolute', left: width * glintX - span / 2 + Math.sin(seconds + i) * width * 0.01, top: y, width: span, height: Math.max(2, depth * 0.006), borderRadius: 4, background: glint, opacity: shimmer * (1 - i / 16) }} />
      })}
      <Hills color={colors[1]} baseY={horizonY + depth * 0.45} amplitude={depth * 0.05} waves={5} offset={seconds * width * 0.05} opacity={0.6} />
      <Hills color={colors[2]} baseY={horizonY + depth * 0.7} amplitude={depth * 0.06} waves={4} offset={-seconds * width * 0.08} opacity={0.85} />
    </>
  )
}
