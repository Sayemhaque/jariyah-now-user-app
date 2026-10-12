import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'

const archCount = 5

export const ArchColonnade: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const archWidth = width / archCount
  const glow = 0.5 + 0.5 * Math.sin((frame / fps) * 0.8)
  const top = height * 0.58

  const arch = (index: number) => {
    const left = index * archWidth
    const mid = left + archWidth / 2
    const inset = archWidth * 0.14
    return `M${left + inset},${height} L${left + inset},${top} Q${left + inset},${top - archWidth * 0.55} ${mid},${top - archWidth * 0.75} Q${left + archWidth - inset},${top - archWidth * 0.55} ${left + archWidth - inset},${top} L${left + archWidth - inset},${height} Z`
  }

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: archCount }, (_, index) => (
        <path
          key={index}
          d={arch(index)}
          fill={withAlpha(color, 0.035 + 0.03 * glow * (index === 2 ? 1.6 : 1))}
          stroke={withAlpha(color, 0.28)}
          strokeWidth={Math.max(1, width * 0.002)}
        />
      ))}
    </svg>
  )
}
