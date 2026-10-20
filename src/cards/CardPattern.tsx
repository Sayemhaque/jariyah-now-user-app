import React from 'react'
import type { CardPattern as Pattern } from '@/lib/cards/types'

interface CardPatternProps {
  pattern: Pattern
  color: string
  opacity: number
  width: number
  height: number
}

const starPath = 'M30 6 L36 24 L54 30 L36 36 L30 54 L24 36 L6 30 L24 24 Z M30 14 L42 30 L30 46 L18 30 Z'

export const CardPattern: React.FC<CardPatternProps> = ({ pattern, color, opacity, width, height }) => {
  const id = React.useId().replace(/:/g, '')
  if (pattern === 'none') return null
  const cx = width / 2
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity }}>
      <defs>
        <pattern id={`stars${id}`} width="60" height="60" patternUnits="userSpaceOnUse">
          <path d={starPath} fill="none" stroke={color} strokeWidth="1" />
        </pattern>
        <pattern id={`lattice${id}`} width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="48" height="48" fill="none" stroke={color} strokeWidth="0.8" />
          <circle cx="24" cy="24" r="2" fill={color} />
        </pattern>
      </defs>
      {pattern === 'stars' && <rect width={width} height={height} fill={`url(#stars${id})`} />}
      {pattern === 'lattice' && <rect width={width} height={height} fill={`url(#lattice${id})`} />}
      {pattern === 'arch' && (
        <g fill="none" stroke={color} strokeWidth="2">
          {[0, 26, 52].map((inset) => (
            <path key={inset} d={`M${110 + inset} ${height - 70} V${height * 0.36} Q${110 + inset} ${110 + inset} ${cx} ${60 + inset} Q${width - 110 - inset} ${110 + inset} ${width - 110 - inset} ${height * 0.36} V${height - 70}`} />
          ))}
        </g>
      )}
      {pattern === 'rays' && (
        <g stroke={color} strokeWidth="1.2">
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (Math.PI * (i + 0.5)) / 36
            return <line key={i} x1={cx} y1={-40} x2={cx + Math.cos(angle) * height * 1.4} y2={-40 + Math.sin(angle) * height * 1.4} />
          })}
        </g>
      )}
    </svg>
  )
}
