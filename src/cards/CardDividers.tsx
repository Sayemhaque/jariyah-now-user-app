import React from 'react'
import type { DividerStyle } from '@/lib/cards/types'
import { CardDivider } from './CardOrnament'

const star = 'M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z'

export const StyledDivider: React.FC<{ style: DividerStyle; color: string }> = ({ style, color }) => {
  const width = 260
  const cx = width / 2
  switch (style) {
    case 'star':
      return (
        <svg width={width} height="26" viewBox={`0 0 ${width} 26`}>
          <line x1="0" y1="13" x2={cx - 24} y2="13" stroke={color} strokeWidth="1.2" />
          <line x1={cx + 24} y1="13" x2={width} y2="13" stroke={color} strokeWidth="1.2" />
          <path d={star} transform={`translate(${cx} 13)`} fill={color} />
        </svg>
      )
    case 'dots':
      return (
        <svg width="90" height="14" viewBox="0 0 90 14">
          {[15, 45, 75].map((x, i) => <circle key={x} cx={x} cy="7" r={i === 1 ? 5 : 3.5} fill={color} />)}
        </svg>
      )
    case 'wave':
      return (
        <svg width={width} height="20" viewBox={`0 0 ${width} 20`}>
          <path d={`M0 10 Q${width / 8} 0 ${width / 4} 10 T${width / 2} 10 T${(width * 3) / 4} 10 T${width} 10`} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case 'line':
      return <div style={{ width: 180, height: 1.5, background: color }} />
    default:
      return <CardDivider color={color} />
  }
}
