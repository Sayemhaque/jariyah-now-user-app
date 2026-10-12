import React from 'react'

interface AyatProgressProps {
  progress: number
  color: string
  thickness: number
  gap: number
}

export const AyatProgress: React.FC<AyatProgressProps> = ({ progress, color, thickness, gap }) => (
  <div
    style={{
      width: '100%',
      height: thickness,
      marginTop: gap,
      borderRadius: thickness,
      background: 'rgba(255,255,255,0.12)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${progress * 100}%`,
        height: '100%',
        borderRadius: thickness,
        background: `linear-gradient(90deg, ${color}aa, ${color})`,
        boxShadow: `0 0 ${thickness * 3}px ${color}`,
      }}
    />
  </div>
)
