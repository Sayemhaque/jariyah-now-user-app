import React from 'react'
import { useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'

export const ArchFrame: React.FC<{ color: string; trim: string }> = ({ color, trim }) => {
  const { width, height } = useVideoConfig()
  const left = width * 0.07
  const right = width * 0.93
  const mid = width / 2
  const shoulder = height * 0.32
  const tip = -height * 0.04
  const opening = `M${left},${height} L${left},${shoulder} C${left},${shoulder - (shoulder - tip) * 0.55} ${mid - width * 0.18},${tip + height * 0.05} ${mid},${tip} C${mid + width * 0.18},${tip + height * 0.05} ${right},${shoulder - (shoulder - tip) * 0.55} ${right},${shoulder} L${right},${height} Z`
  const stroke = Math.max(2, width * 0.006)

  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="lattice" width={width * 0.05} height={width * 0.05} patternUnits="userSpaceOnUse">
          <path
            d={`M0,${width * 0.025} L${width * 0.025},0 L${width * 0.05},${width * 0.025} L${width * 0.025},${width * 0.05} Z`}
            fill="none"
            stroke={withAlpha(trim, 0.16)}
            strokeWidth={1}
          />
        </pattern>
      </defs>
      <path d={`M0,0 L${width},0 L${width},${height} L0,${height} Z ${opening}`} fill={color} fillRule="evenodd" />
      <path d={`M0,0 L${width},0 L${width},${height} L0,${height} Z ${opening}`} fill="url(#lattice)" fillRule="evenodd" />
      <path d={opening} fill="none" stroke={trim} strokeWidth={stroke} opacity={0.85} />
      <path d={opening} fill="none" stroke={withAlpha(trim, 0.35)} strokeWidth={stroke * 4} opacity={0.4} transform={`translate(0 ${stroke * 2.5})`} />
    </svg>
  )
}
