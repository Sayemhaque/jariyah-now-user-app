import React from 'react'

interface AyatProgressProps {
  progress: number
  color: string
  thickness: number
  width: number
  gap: number
}

export const AyatProgress: React.FC<AyatProgressProps> = ({ progress, color, thickness, width, gap }) => (
  <div style={{ width, height: thickness, marginTop: gap, borderRadius: thickness, background: 'rgba(255,255,255,0.14)' }}>
    <div
      style={{
        width: `${progress * 100}%`,
        height: '100%',
        borderRadius: thickness,
        background: color,
        boxShadow: `0 0 ${thickness * 4}px ${color}`,
      }}
    />
  </div>
)
