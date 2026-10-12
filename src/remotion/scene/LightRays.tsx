import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'

export const LightRays: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const size = Math.max(width, height) * 2
  const ray = withAlpha(color, 0.12)

  return (
    <div
      style={{
        position: 'absolute',
        left: width / 2 - size / 2,
        top: -size * 0.62,
        width: size,
        height: size,
        background: `repeating-conic-gradient(from ${seconds * 2}deg, ${ray} 0deg 4deg, transparent 4deg 13deg)`,
        maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, transparent 62%)',
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.9) 0%, transparent 62%)',
        opacity: 0.8 + 0.2 * Math.sin(seconds * 0.8),
      }}
    />
  )
}
