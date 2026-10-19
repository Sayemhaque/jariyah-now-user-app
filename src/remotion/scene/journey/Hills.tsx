import React from 'react'
import { useVideoConfig } from 'remotion'

interface HillsProps {
  color: string
  baseY: number
  amplitude: number
  waves: number
  offset: number
  opacity?: number
}

export const Hills: React.FC<HillsProps> = ({ color, baseY, amplitude, waves, offset, opacity = 1 }) => {
  const { width, height } = useVideoConfig()
  const points = Array.from({ length: 61 }, (_, i) => {
    const x = (i / 60) * width
    const phase = ((x + offset) / width) * Math.PI * 2 * waves
    const y = baseY - amplitude * (0.6 * Math.sin(phase) + 0.4 * Math.sin(phase * 2.3 + 1.7))
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <polygon points={`0,${height} ${points.join(' ')} ${width},${height}`} fill={color} opacity={opacity} />
    </svg>
  )
}
