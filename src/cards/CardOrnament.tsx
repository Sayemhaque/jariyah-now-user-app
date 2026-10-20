import React from 'react'

export const CardDivider: React.FC<{ color: string; width?: number }> = ({ color, width = 260 }) => (
  <svg width={width} height="24" viewBox={`0 0 ${width} 24`} style={{ display: 'block' }}>
    <line x1="0" y1="12" x2={width / 2 - 22} y2="12" stroke={color} strokeWidth="1.2" />
    <line x1={width / 2 + 22} y1="12" x2={width} y2="12" stroke={color} strokeWidth="1.2" />
    <path d={`M${width / 2} 2 L${width / 2 + 10} 12 L${width / 2} 22 L${width / 2 - 10} 12 Z`} fill="none" stroke={color} strokeWidth="1.4" />
    <circle cx={width / 2} cy="12" r="2.6" fill={color} />
    <circle cx={width / 2 - 34} cy="12" r="2" fill={color} />
    <circle cx={width / 2 + 34} cy="12" r="2" fill={color} />
  </svg>
)

export const CardCorner: React.FC<{ color: string; rotate: number; style: React.CSSProperties }> = ({ color, rotate, style }) => (
  <svg width="74" height="74" viewBox="0 0 74 74" style={{ position: 'absolute', transform: `rotate(${rotate}deg)`, ...style }}>
    <path d="M2 40 V2 H40" fill="none" stroke={color} strokeWidth="1.6" />
    <path d="M12 52 V12 H52" fill="none" stroke={color} strokeWidth="0.9" opacity="0.7" />
    <path d="M24 16 L28 24 L36 28 L28 32 L24 40 L20 32 L12 28 L20 24 Z" fill={color} opacity="0.9" transform="translate(-4 -4)" />
  </svg>
)
