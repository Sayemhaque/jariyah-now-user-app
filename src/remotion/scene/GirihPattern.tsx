import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'

export const GirihPattern: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const tile = Math.min(width, height) * 0.16
  const size = Math.hypot(width, height) * 1.1
  const stroke = withAlpha(color, 0.2)
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><g fill='none' stroke='${stroke}' stroke-width='1.2'><path d='M50 6 L62 38 L94 50 L62 62 L50 94 L38 62 L6 50 L38 38 Z'/><rect x='29' y='29' width='42' height='42' transform='rotate(45 50 50)'/><circle cx='50' cy='50' r='9'/></g></svg>`,
  )
  return (
    <div
      style={{
        position: 'absolute',
        left: (width - size) / 2,
        top: (height - size) / 2,
        width: size,
        height: size,
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundSize: `${tile}px ${tile}px`,
        transform: `rotate(${(frame / fps) * 1.6}deg)`,
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)',
      }}
    />
  )
}
