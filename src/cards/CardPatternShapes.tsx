import React from 'react'

interface ShapeProps {
  color: string
  width: number
  height: number
}

const veins = [
  [0.0, 0.18, 0.35, 0.05, 0.62, 0.3, 1.0, 0.16, 1.6],
  [0.0, 0.62, 0.3, 0.48, 0.55, 0.76, 1.0, 0.58, 1.1],
  [0.2, 1.0, 0.38, 0.72, 0.7, 0.96, 1.0, 0.82, 0.8],
  [0.0, 0.88, 0.25, 0.8, 0.4, 0.98, 0.62, 1.0, 0.6],
  [0.45, 0.0, 0.52, 0.22, 0.78, 0.12, 1.0, 0.34, 0.7],
]

export const MarbleVeins: React.FC<ShapeProps> = ({ color, width, height }) => (
  <g fill="none" stroke={color} strokeLinecap="round">
    {veins.map(([x0, y0, x1, y1, x2, y2, x3, y3, weight], i) => (
      <path key={i} d={`M${x0! * width} ${y0! * height} C${x1! * width} ${y1! * height} ${x2! * width} ${y2! * height} ${x3! * width} ${y3! * height}`} strokeWidth={weight} opacity={0.5 + (i % 2) * 0.3} />
    ))}
  </g>
)

function starPoints(cx: number, cy: number, outer: number, inner: number, points = 8): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI * i) / points - Math.PI / 2
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`
  }).join(' ')
}

export const Rosette: React.FC<ShapeProps> = ({ color, width, height }) => {
  const cx = width / 2
  const cy = height / 2
  const size = Math.min(width, height) * 0.46
  return (
    <g fill="none" stroke={color} strokeWidth="1.4">
      <circle cx={cx} cy={cy} r={size} />
      <circle cx={cx} cy={cy} r={size * 0.94} strokeWidth="0.7" />
      <polygon points={starPoints(cx, cy, size * 0.9, size * 0.62)} />
      <polygon points={starPoints(cx, cy, size * 0.9, size * 0.62)} transform={`rotate(22.5 ${cx} ${cy})`} strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={size * 0.5} strokeWidth="0.8" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 16
        return <circle key={i} cx={cx + Math.cos(a) * size * 1.08} cy={cy + Math.sin(a) * size * 1.08} r={size * 0.04} />
      })}
    </g>
  )
}

export const Waves: React.FC<ShapeProps> = ({ color, width, height }) => (
  <g fill="none" stroke={color} strokeWidth="1.3">
    {Array.from({ length: 9 }, (_, i) => {
      const y = height * 0.78 + i * 26
      const amp = 18 + i * 2
      return <path key={i} d={`M0 ${y} Q${width * 0.25} ${y - amp} ${width * 0.5} ${y} T${width} ${y}`} opacity={1 - i * 0.08} />
    })}
    {Array.from({ length: 5 }, (_, i) => {
      const y = height * 0.12 - i * 22
      return <path key={`t${i}`} d={`M0 ${y} Q${width * 0.25} ${y + 16} ${width * 0.5} ${y} T${width} ${y}`} opacity={0.7 - i * 0.1} />
    })}
  </g>
)
