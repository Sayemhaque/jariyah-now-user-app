import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'

const ribbons = [
  { hueShift: 0, top: 0.12, speed: 0.11, size: 0.9 },
  { hueShift: 1, top: 0.24, speed: -0.08, size: 1.1 },
  { hueShift: 2, top: 0.36, speed: 0.06, size: 0.8 },
]

export const AuroraRibbons: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const tones = [color, '#8a7dff', '#4fd1ff']

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', filter: `blur(${Math.min(width, height) * 0.06}px)` }}>
      {ribbons.map((ribbon, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: -width * 0.3 + Math.sin(seconds * ribbon.speed * 3 + index) * width * 0.15,
            top: height * ribbon.top + Math.sin(seconds * 0.4 + index * 2) * height * 0.03,
            width: width * 1.6 * ribbon.size,
            height: height * 0.12,
            borderRadius: '50%',
            background: `linear-gradient(90deg, transparent, ${withAlpha(tones[ribbon.hueShift]!, 0.55)}, transparent)`,
            transform: `rotate(${-8 + Math.sin(seconds * 0.3 + index) * 6}deg)`,
            opacity: 0.55 + 0.25 * Math.sin(seconds * 0.7 + index),
          }}
        />
      ))}
    </div>
  )
}
