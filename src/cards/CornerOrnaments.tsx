import React from 'react'
import type { CardTheme, CornerStyle } from '@/lib/cards/types'
import { Crescent } from './EyebrowShapes'

const starPath = 'M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4 Z'

const Lantern: React.FC<{ x: number; color: string; drop: number }> = ({ x, color, drop }) => (
  <g transform={`translate(${x} 0)`}>
    <line x1="0" y1="0" x2="0" y2={drop} stroke={color} strokeWidth="1.4" />
    <path d={`M-14 ${drop + 8} L14 ${drop + 8} L20 ${drop + 34} L12 ${drop + 74} L-12 ${drop + 74} L-20 ${drop + 34} Z`} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.6" />
    <path d={`M-8 ${drop} L8 ${drop} L14 ${drop + 8} L-14 ${drop + 8} Z`} fill={color} />
    <line x1="-20" y1={drop + 34} x2="20" y2={drop + 34} stroke={color} strokeWidth="1" />
    <circle cx="0" cy={drop + 50} r="5" fill={color} opacity="0.8" />
    <path d={`M-6 ${drop + 74} L0 ${drop + 88} L6 ${drop + 74} Z`} fill={color} />
  </g>
)

export const CornerOrnaments: React.FC<{ style: CornerStyle; theme: CardTheme; width: number; height: number }> = ({ style, theme, width, height }) => {
  if (style === 'none') return null
  const color = theme.accent
  const corners: [number, number][] = [[96, 96], [width - 96, 96], [96, height - 96], [width - 96, height - 96]]
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {style === 'stars' && corners.map(([x, y], i) => <path key={i} d={starPath} transform={`translate(${x} ${y})`} fill={color} opacity="0.75" />)}
      {style === 'arabesque' &&
        corners.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${[0, 90, 270, 180][i]})`} fill="none" stroke={color} strokeWidth="1.4" opacity="0.7">
            <path d="M-44 -44 m0 64 a64 64 0 0 1 64 -64" />
            <path d="M-44 -44 m0 40 a40 40 0 0 1 40 -40" />
            <circle cx="-44" cy="-44" r="6" fill={color} />
          </g>
        ))}
      {style === 'crescents' && (
        <>
          <foreignObject x={70} y={70} width={60} height={60}><Crescent color={color} size={52} /></foreignObject>
          <foreignObject x={width - 130} y={70} width={60} height={60}><div style={{ transform: 'scaleX(-1)' }}><Crescent color={color} size={52} /></div></foreignObject>
        </>
      )}
      {style === 'lanterns' && (
        <>
          <Lantern x={120} color={color} drop={40} />
          <Lantern x={width - 120} color={color} drop={90} />
        </>
      )}
    </svg>
  )
}
