import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { useAudioBars } from '../useAudioBars'

const rayCount = 48
const starPoints = (radius: number, rotation: number) =>
  Array.from({ length: 16 }, (_, i) => {
    const angle = (Math.PI / 8) * i + rotation
    const r = i % 2 ? radius * 0.76 : radius
    return `${(Math.cos(angle) * r).toFixed(2)},${(Math.sin(angle) * r).toFixed(2)}`
  }).join(' ')

export const BloomRosette: React.FC<{ audioUrl: string; size: number; accent: string }> = ({ audioUrl, size, accent }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const levels = useAudioBars(audioUrl, frame, fps, rayCount / 2)
  const spin = (frame / fps) * 0.05
  const levelAt = (i: number) => {
    const mirrored = i < rayCount / 2 ? i : rayCount - 1 - i
    return levels ? Math.max(0.12, levels[mirrored] ?? 0) : 0.3 + 0.2 * Math.abs(Math.sin(frame / fps * 2 + i * 0.6))
  }
  return (
    <svg viewBox="-380 -380 760 760" width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="bloom-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe3a0" />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <radialGradient id="bloom-glow">
          <stop offset="0" stopColor="rgba(255,210,125,.20)" />
          <stop offset="1" stopColor="rgba(255,210,125,0)" />
        </radialGradient>
      </defs>
      <circle r={360} fill="url(#bloom-glow)" />
      {Array.from({ length: rayCount }, (_, i) => {
        const angle = (Math.PI * 2 * i) / rayCount - Math.PI / 2
        const level = levelAt(i)
        const outer = 300 + 70 * level
        return <line key={i} x1={Math.cos(angle) * 304} y1={Math.sin(angle) * 304} x2={Math.cos(angle) * outer} y2={Math.sin(angle) * outer} stroke="url(#bloom-gold)" strokeWidth={6} strokeLinecap="round" opacity={0.35 + 0.65 * level} />
      })}
      <g transform={`rotate(${spin * 57.3})`}>
        <polygon points={starPoints(292, 0)} fill="none" stroke="url(#bloom-gold)" strokeWidth={3} opacity={0.9} />
        <polygon points={starPoints(292, Math.PI / 16)} fill="none" stroke="url(#bloom-gold)" strokeWidth={1.5} opacity={0.45} />
      </g>
      <g transform={`rotate(${-spin * 80})`}>
        <polygon points={starPoints(250, Math.PI / 8)} fill="none" stroke="url(#bloom-gold)" strokeWidth={1.2} opacity={0.3} />
      </g>
      <circle r={300} fill="none" stroke="url(#bloom-gold)" strokeWidth={1.5} opacity={0.6} />
    </svg>
  )
}
