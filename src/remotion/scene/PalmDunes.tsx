import React from 'react'
import { useVideoConfig } from 'remotion'

const palm = (x: number, base: number, h: number, lean: number) => {
  const top = base - h
  const crown = `${x + lean},${top}`
  const fronds = [-1, -0.55, 0, 0.55, 1]
    .map((d) => `M${crown} Q${x + lean + d * 55},${top - 30 + Math.abs(d) * 10} ${x + lean + d * 95},${top + 25 + Math.abs(d) * 25} Q${x + lean + d * 50},${top - 5} ${crown} Z`)
    .join(' ')
  return `M${x - 6},${base} Q${x + lean * 0.4},${base - h * 0.5} ${x + lean - 3},${top} L${x + lean + 3},${top} Q${x + lean * 0.4 + 8},${base - h * 0.5} ${x + 6},${base} Z ${fronds}`
}

export const PalmDunes: React.FC<{ color: string }> = ({ color }) => {
  const { width, height } = useVideoConfig()
  const sceneHeight = Math.min(height * 0.3, width * 0.32)

  return (
    <svg viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax meet" width={width} height={sceneHeight} style={{ position: 'absolute', left: 0, bottom: 0 }}>
      <path d="M0,320 L0,210 Q180,150 360,200 Q560,250 720,190 Q860,140 1000,185 L1000,320 Z" fill={color} opacity="0.75" />
      <path d="M0,320 L0,250 Q240,205 470,245 Q700,285 1000,235 L1000,320 Z" fill={color} />
      <path d={palm(160, 240, 190, 30)} fill={color} />
      <path d={palm(225, 245, 140, -20)} fill={color} />
      <path d={palm(820, 236, 170, -25)} fill={color} />
    </svg>
  )
}
