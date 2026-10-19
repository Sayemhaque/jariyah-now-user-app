import React from 'react'

interface TrainProps {
  x: number
  groundY: number
  scale: number
  seconds: number
  color: string
  window: string
  cars: number
}

const carLength = 210

const Carriage: React.FC<{ offset: number; color: string; window: string; spin: number; engine: boolean }> = ({ offset, color, window, spin, engine }) => (
  <g transform={`translate(${-offset} 0)`}>
    <path d={engine ? 'M-100,-24 L-100,-92 L60,-92 Q100,-90 104,-50 L104,-24 Z' : 'M-100,-24 L-100,-88 L100,-88 L100,-24 Z'} fill={color} />
    {Array.from({ length: engine ? 3 : 5 }, (_, i) => (
      <rect key={i} x={-86 + i * 36} y={-76} width={24} height={22} rx={3} fill={window} opacity={0.85} />
    ))}
    {[-66, 66].map((cx) => (
      <g key={cx} transform={`translate(${cx} -20) rotate(${spin})`}>
        <circle r={16} fill={color} />
        <line x1={-10} x2={10} y1={0} y2={0} stroke={window} strokeWidth={2} opacity={0.4} />
      </g>
    ))}
    {!engine && <rect x={100} y={-50} width={10} height={8} fill={color} />}
  </g>
)

export const Train: React.FC<TrainProps> = ({ x, groundY, scale, seconds, color, window, cars }) => {
  const spin = (seconds * 600) % 360
  return (
    <g transform={`translate(${x} ${groundY}) scale(${scale})`}>
      {Array.from({ length: cars }, (_, i) => (
        <Carriage key={i} offset={i * carLength} color={color} window={window} spin={spin} engine={i === 0} />
      ))}
      <rect x={-carLength * cars} y={-6} width={carLength * (cars + 1)} height={6} fill={color} />
    </g>
  )
}
