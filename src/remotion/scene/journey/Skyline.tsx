import React from 'react'
import { useVideoConfig } from 'remotion'
import { seeded } from '../seeded'

export const Skyline: React.FC<{ groundY: number; color: string; window: string; seconds: number; heightScale: number }> = ({ groundY, color, window, seconds, heightScale }) => {
  const { width, height } = useVideoConfig()
  const unit = Math.min(width, height) / 1080
  const buildings = Math.ceil(width / (unit * 90)) + 1
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: buildings }, (_, i) => {
        const w = unit * (60 + seeded(i, 91) * 60)
        const h = height * heightScale * (0.35 + seeded(i, 92) * 0.65)
        const x = i * unit * 90 - unit * 20
        const cols = Math.max(1, Math.floor(w / (unit * 22)))
        const rows = Math.floor(h / (unit * 30))
        return (
          <g key={i}>
            <rect x={x} y={groundY - h} width={w} height={h} fill={color} />
            {i % 4 === 1 && <path d={`M${x + w / 2 - unit * 20},${groundY - h} q${unit * 20},${-unit * 40} ${unit * 40},0`} fill={color} />}
            {Array.from({ length: rows * cols }, (_, k) => {
              const lit = seeded(i * 50 + k, 93) > 0.62
              const flicker = 0.55 + 0.45 * Math.abs(Math.sin(seconds * 0.3 + k + i))
              return lit ? <rect key={k} x={x + unit * 8 + (k % cols) * unit * 22} y={groundY - h + unit * 12 + Math.floor(k / cols) * unit * 30} width={unit * 9} height={unit * 13} fill={window} opacity={0.7 * flicker} /> : null
            })}
          </g>
        )
      })}
    </svg>
  )
}
