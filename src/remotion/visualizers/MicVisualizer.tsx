import React from 'react'
import { withAlpha } from '@/lib/color'
import { useVisualizerLevels, type VisualizerShapeProps } from './useVisualizerLevels'

export const MicVisualizer: React.FC<VisualizerShapeProps> = ({ audioUrl, accent, height }) => {
  const { average, seconds } = useVisualizerLevels(audioUrl, 12)
  const size = height * 1.25
  return (
    <svg viewBox="-60 -20 240 140" width={size * 1.8} height={size} style={{ overflow: 'visible' }}>
      {[0, 1, 2].map((ring) => {
        const progress = (seconds * 0.7 + ring / 3) % 1
        return (
          <circle key={ring} cx={60} cy={34} r={30 + progress * 55} fill="none" stroke={accent} strokeWidth={2.5}
            opacity={(1 - progress) * Math.min(1, 0.2 + average * 1.4)} />
        )
      })}
      <circle cx={60} cy={34} r={34 + average * 10} fill={withAlpha(accent, 0.12)} />
      <rect x={47} y={4} width={26} height={54} rx={13} fill={accent} />
      {[18, 28, 38].map((y) => (
        <line key={y} x1={51} x2={69} y1={y} y2={y} stroke={withAlpha('#000000', 0.22)} strokeWidth={2.5} strokeLinecap="round" />
      ))}
      <path d="M36 40 A24 24 0 0 0 84 40" fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" />
      <line x1={60} x2={60} y1={64} y2={82} stroke={accent} strokeWidth={5} strokeLinecap="round" />
      <line x1={46} x2={74} y1={84} y2={84} stroke={accent} strokeWidth={5} strokeLinecap="round" />
    </svg>
  )
}
