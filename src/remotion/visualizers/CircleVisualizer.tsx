import React from 'react'
import { withAlpha } from '@/lib/color'
import { useVisualizerLevels, type VisualizerShapeProps } from './useVisualizerLevels'

const rays = 48

export const CircleVisualizer: React.FC<VisualizerShapeProps> = ({ audioUrl, accent, height }) => {
  const { values, average } = useVisualizerLevels(audioUrl, rays / 2)
  const size = height * 1.25
  const inner = size * 0.24
  return (
    <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <circle r={inner * (0.9 + average * 0.25)} fill={withAlpha(accent, 0.12)} stroke={accent} strokeWidth={Math.max(1.5, size * 0.012)} />
      <circle r={inner * 0.45} fill={accent} opacity={0.35 + average * 0.5} />
      {Array.from({ length: rays }, (_, i) => {
        const angle = (Math.PI * 2 * i) / rays - Math.PI / 2
        const level = values[i < rays / 2 ? i : rays - 1 - i] ?? 0
        const from = inner * 1.25
        const to = from + (size / 2 - from) * Math.max(0.12, level)
        return (
          <line key={i} x1={Math.cos(angle) * from} y1={Math.sin(angle) * from} x2={Math.cos(angle) * to} y2={Math.sin(angle) * to}
            stroke={accent} strokeWidth={Math.max(2, size * 0.022)} strokeLinecap="round" opacity={0.4 + 0.6 * level} />
        )
      })}
    </svg>
  )
}
