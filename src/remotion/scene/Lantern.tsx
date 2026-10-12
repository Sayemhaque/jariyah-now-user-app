import React from 'react'
import { withAlpha } from '@/lib/color'

interface LanternProps {
  x: number
  ropeLength: number
  size: number
  swingDeg: number
  glow: number
  metal: string
  light: string
}

export const Lantern: React.FC<LanternProps> = ({ x, ropeLength, size, swingDeg, glow, metal, light }) => (
  <div style={{ position: 'absolute', left: x, top: 0, transformOrigin: 'top center', transform: `rotate(${swingDeg}deg)` }}>
    <div style={{ width: 1.5, height: ropeLength, background: withAlpha(metal, 0.7), margin: '0 auto' }} />
    <div
      style={{
        position: 'absolute',
        left: -size * 1.5,
        top: ropeLength - size * 0.6,
        width: size * 3,
        height: size * 3,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${withAlpha(light, 0.45 * glow)} 0%, transparent 65%)`,
      }}
    />
    <svg
      width={size}
      height={size * 1.7}
      viewBox="0 0 60 102"
      style={{ position: 'absolute', left: -size / 2, top: ropeLength - 2, overflow: 'visible' }}
    >
      <path d="M30,0 L38,10 L22,10 Z" fill={metal} />
      <path d="M14,14 L46,14 L40,10 L20,10 Z" fill={metal} />
      <path d="M14,14 L46,14 L52,40 L46,76 L14,76 L8,40 Z" fill={withAlpha(light, 0.85 * glow + 0.1)} />
      <path
        d="M14,14 L46,14 L52,40 L46,76 L14,76 L8,40 Z M30,14 L30,76 M8,40 L52,40 M19,14 L13,76 M41,14 L47,76"
        fill="none"
        stroke={metal}
        strokeWidth="2.4"
      />
      <path d="M12,76 L48,76 L42,86 L18,86 Z" fill={metal} />
      <path d="M26,86 L34,86 L30,100 Z" fill={metal} />
    </svg>
  </div>
)
