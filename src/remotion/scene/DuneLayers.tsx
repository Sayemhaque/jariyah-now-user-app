import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'

const layers = [
  { y: 0.7, amplitude: 0.05, speed: 0.6, shade: 0.55 },
  { y: 0.78, amplitude: 0.04, speed: 1, shade: 0.75 },
  { y: 0.86, amplitude: 0.03, speed: 1.5, shade: 0.95 },
]

export const DuneLayers: React.FC<{ color: string; base: string }> = ({ color, base }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const shift = (frame / fps) * width * 0.01
  const sunSize = Math.min(width, height) * 0.5

  const dune = (layer: (typeof layers)[number]) => {
    const points = Array.from({ length: 9 }, (_, i) => {
      const x = (i / 8) * width
      const y = height * (layer.y + Math.sin((x + shift * layer.speed) / (width * 0.22)) * layer.amplitude)
      return `${x},${y}`
    })
    return `M0,${height} L${points.join(' L')} L${width},${height} Z`
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - sunSize / 2,
          top: height * 0.6,
          width: sunSize,
          height: sunSize,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
          opacity: 0.45,
        }}
      />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {layers.map((layer, index) => (
          <path key={index} d={dune(layer)} fill={base} opacity={layer.shade} />
        ))}
      </svg>
    </div>
  )
}
