import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'
import { FilmGrain } from './FilmGrain'

const ribbons = [
  { y: 0.2, amp: 0.05, k: 2.2, speed: 0.35, phase: 0, opacity: 0.55 },
  { y: 0.34, amp: 0.07, k: 1.6, speed: -0.25, phase: 1.5, opacity: 0.35 },
  { y: 0.68, amp: 0.06, k: 1.9, speed: 0.3, phase: 3, opacity: 0.45 },
  { y: 0.82, amp: 0.05, k: 2.6, speed: -0.32, phase: 4.2, opacity: 0.6 },
]

function ribbonPath(width: number, height: number, ribbon: (typeof ribbons)[number], seconds: number) {
  const points = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * width * 1.2 - width * 0.1
    const y = height * (ribbon.y + ribbon.amp * Math.sin((i / 40) * Math.PI * ribbon.k + seconds * ribbon.speed + ribbon.phase))
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
  })
  return points.join(' ')
}

export const LiquidGold: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const unit = Math.min(width, height) / 100

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${withAlpha(palette.accent, 0.12)} 0%, transparent 60%)` }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="liquid-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={palette.accent} stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff1c9" />
            <stop offset="1" stopColor={palette.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ribbons.map((ribbon, index) => {
          const d = ribbonPath(width, height, ribbon, seconds)
          return (
            <g key={index} opacity={ribbon.opacity}>
              <path d={d} fill="none" stroke="url(#liquid-gold)" strokeWidth={unit * 6} strokeOpacity={0.08} strokeLinecap="round" />
              <path d={d} fill="none" stroke="url(#liquid-gold)" strokeWidth={unit * 2} strokeOpacity={0.18} strokeLinecap="round" />
              <path d={d} fill="none" stroke="url(#liquid-gold)" strokeWidth={Math.max(1, unit * 0.25)} />
            </g>
          )
        })}
      </svg>
      <FilmGrain opacity={0.06} />
    </>
  )
}
