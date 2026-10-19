import React from 'react'
import { withAlpha } from '@/lib/color'
import { useVisualizerLevels, type VisualizerShapeProps } from './useVisualizerLevels'

const halfBars = 20

export const BarsVisualizer: React.FC<VisualizerShapeProps> = ({ audioUrl, accent, width, height }) => {
  const { values } = useVisualizerLevels(audioUrl, halfBars)
  const barWidth = (width / (halfBars * 2)) * 0.55
  const levelAt = (index: number) => {
    const fromCenter = Math.abs(index - halfBars + 0.5) - 0.5
    return Math.max(0.08, (values[Math.round(fromCenter)] ?? 0) * (1 - (fromCenter / halfBars) * 0.35))
  }
  return (
    <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {Array.from({ length: halfBars * 2 }, (_, index) => (
        <div
          key={index}
          style={{ width: barWidth, height: `${levelAt(index) * 100}%`, borderRadius: barWidth, background: `linear-gradient(180deg, ${accent} 0%, ${withAlpha(accent, 0.35)} 100%)` }}
        />
      ))}
    </div>
  )
}
