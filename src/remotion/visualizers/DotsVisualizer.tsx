import React from 'react'
import { withAlpha } from '@/lib/color'
import { useVisualizerLevels, type VisualizerShapeProps } from './useVisualizerLevels'

const half = 8

export const DotsVisualizer: React.FC<VisualizerShapeProps> = ({ audioUrl, accent, width, height }) => {
  const { values } = useVisualizerLevels(audioUrl, half)
  const dot = Math.min(height * 0.32, width / (half * 2 * 1.9))
  return (
    <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: dot * 0.9 }}>
      {Array.from({ length: half * 2 }, (_, index) => {
        const level = values[Math.abs(index - half + 0.5) - 0.5] ?? values[0]!
        return (
          <div key={index} style={{ width: dot, height: dot * (1 + level * 2.6), borderRadius: dot, background: withAlpha(accent, 0.45 + 0.55 * level) }} />
        )
      })}
    </div>
  )
}
