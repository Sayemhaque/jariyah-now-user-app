import React from 'react'
import { useVisualizerLevels, type VisualizerShapeProps } from './useVisualizerLevels'

const points = 24

function wavePath(values: number[], width: number, height: number, direction: 1 | -1, seconds: number) {
  const mid = height / 2
  const coords = Array.from({ length: points * 2 + 1 }, (_, i) => {
    const fromCenter = Math.abs(i - points)
    const level = (values[fromCenter] ?? 0) * (1 - fromCenter / (points + 2))
    const wobble = Math.sin(i * 0.9 + seconds * 4) * 0.15 + 0.85
    return [(i / (points * 2)) * width, mid - direction * level * wobble * mid * 0.95] as const
  })
  return coords.reduce((d, [x, y], i) => {
    if (!i) return `M${x},${y}`
    const [px, py] = coords[i - 1]!
    return `${d} Q${px},${py} ${(px + x) / 2},${(py + y) / 2}`
  }, '')
}

export const WaveVisualizer: React.FC<VisualizerShapeProps> = ({ audioUrl, accent, width, height }) => {
  const { values, seconds } = useVisualizerLevels(audioUrl, points + 1)
  const stroke = Math.max(2, height * 0.05)
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="wave-fade" x1="0" x2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0" />
          <stop offset="0.5" stopColor={accent} />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={wavePath(values, width, height, 1, seconds)} fill="none" stroke="url(#wave-fade)" strokeWidth={stroke} strokeLinecap="round" />
      <path d={wavePath(values, width, height, -1, seconds + 0.6)} fill="none" stroke="url(#wave-fade)" strokeWidth={stroke * 0.6} strokeOpacity={0.5} strokeLinecap="round" />
      <line x1={0} x2={width} y1={height / 2} y2={height / 2} stroke="url(#wave-fade)" strokeWidth={1} strokeOpacity={0.35} />
    </svg>
  )
}
