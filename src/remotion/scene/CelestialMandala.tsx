import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { StarField } from './StarField'

const star = (radius: number, points: number, inner: number) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const angle = (Math.PI / points) * i
    const r = i % 2 ? radius * inner : radius
    return `${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`
  }).join(' ')

const rings = [
  { radius: 480, points: 16, inner: 0.82, width: 1.6, opacity: 0.32, spin: 1 },
  { radius: 400, points: 8, inner: 0.7, width: 1.2, opacity: 0.24, spin: -1.5 },
  { radius: 330, points: 12, inner: 0.78, width: 1, opacity: 0.2, spin: 2 },
  { radius: 250, points: 8, inner: 0.62, width: 1, opacity: 0.16, spin: -2.5 },
]

export const CelestialMandala: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const size = Math.min(width, height) * 1.25

  return (
    <>
      <StarField color={palette.pattern} showMoon={false} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 46%, ${withAlpha(palette.accent, 0.14)} 0%, transparent 45%)` }} />
      <svg viewBox="-520 -520 1040 1040" width={size} height={size} style={{ position: 'absolute', left: (width - size) / 2, top: height * 0.46 - size / 2 }}>
        {rings.map((ring, index) => (
          <g key={index} transform={`rotate(${seconds * ring.spin})`} opacity={ring.opacity}>
            <polygon points={star(ring.radius, ring.points, ring.inner)} fill="none" stroke={palette.pattern} strokeWidth={ring.width} />
            <circle r={ring.radius * ring.inner * 0.97} fill="none" stroke={palette.pattern} strokeWidth={ring.width * 0.6} />
          </g>
        ))}
        <circle r={500} fill="none" stroke={palette.pattern} strokeWidth={0.8} opacity={0.18} strokeDasharray="2 10" transform={`rotate(${-seconds * 0.6})`} />
      </svg>
    </>
  )
}
