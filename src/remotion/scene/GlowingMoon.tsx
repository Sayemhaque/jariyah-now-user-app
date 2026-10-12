import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'

export const GlowingMoon: React.FC<{ x: number; y: number; size: number; color: string }> = ({ x, y, size, color }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const breathe = 1 + 0.03 * Math.sin((frame / fps) * 0.6)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - size * 1.6,
          top: y - size * 1.6,
          width: size * 3.2,
          height: size * 3.2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}55 0%, ${color}18 40%, transparent 70%)`,
          transform: `scale(${breathe})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 35%, #fffaf0 0%, ${color} 55%, #9e927c 100%)`,
          boxShadow: `0 0 ${size * 0.35}px ${color}`,
        }}
      >
        {[[0.32, 0.55, 0.16], [0.6, 0.3, 0.1], [0.62, 0.66, 0.12]].map(([cx, cy, r], index) => (
          <div
            key={index}
            style={{ position: 'absolute', left: (cx! - r!) * size, top: (cy! - r!) * size, width: r! * 2 * size, height: r! * 2 * size, borderRadius: '50%', background: 'rgba(120,110,95,0.09)', filter: `blur(${size * 0.01}px)` }}
          />
        ))}
      </div>
    </>
  )
}
