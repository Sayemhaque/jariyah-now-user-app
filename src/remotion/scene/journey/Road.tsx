import React from 'react'
import { useVideoConfig } from 'remotion'
import { worldOffset } from './journeyLayout'

interface RoadProps {
  groundY: number
  unit: number
  seconds: number
  speed: number
  surface: string
  line: string
}

export const Road: React.FC<RoadProps> = ({ groundY, unit, seconds, speed, surface, line }) => {
  const { width, height } = useVideoConfig()
  const dash = unit * 90
  const offset = worldOffset(seconds, speed, dash * 2)
  const laneY = groundY + Math.min(unit * 40, (height - groundY) * 0.45)
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={groundY} width={width} height={height - groundY} fill={surface} />
      <rect x={0} y={groundY} width={width} height={Math.max(1, unit * 3)} fill={line} opacity={0.35} />
      {Array.from({ length: Math.ceil(width / (dash * 2)) + 2 }, (_, i) => (
        <rect key={i} x={i * dash * 2 - offset} y={laneY} width={dash} height={Math.max(2, unit * 5)} rx={unit * 2} fill={line} opacity={0.55} />
      ))}
    </svg>
  )
}
