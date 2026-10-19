import React from 'react'
import { withAlpha } from '@/lib/color'
import { SoundRings } from './SoundRings'
import { useVisualizerLevels, type VisualizerShapeProps } from './useVisualizerLevels'

export const HeadphonesVisualizer: React.FC<VisualizerShapeProps> = ({ audioUrl, accent, height }) => {
  const { average, seconds } = useVisualizerLevels(audioUrl, 12)
  const size = height * 1.25
  const pulse = 1 + average * 0.12
  const tilt = Math.sin(seconds * 1.6) * 3
  return (
    <svg viewBox="-60 -10 240 120" width={size * 2} height={size} style={{ overflow: 'visible' }}>
      <SoundRings cx={8} cy={70} side={-1} level={average} seconds={seconds} accent={accent} base={16} />
      <SoundRings cx={112} cy={70} side={1} level={average} seconds={seconds} accent={accent} base={16} />
      <g transform={`rotate(${tilt} 60 60) translate(60 62) scale(${pulse}) translate(-60 -62)`}>
        <path d="M18 70 V58 A42 42 0 0 1 102 58 V70" fill="none" stroke={accent} strokeWidth={8} strokeLinecap="round" />
        <path d="M26 60 A34 34 0 0 1 94 60" fill="none" stroke={withAlpha(accent, 0.35)} strokeWidth={3} strokeLinecap="round" />
        <rect x={6} y={56} width={22} height={38} rx={10} fill={accent} />
        <rect x={92} y={56} width={22} height={38} rx={10} fill={accent} />
        <rect x={12} y={62} width={10} height={26} rx={5} fill={withAlpha('#000000', 0.18)} />
        <rect x={98} y={62} width={10} height={26} rx={5} fill={withAlpha('#000000', 0.18)} />
      </g>
    </svg>
  )
}
