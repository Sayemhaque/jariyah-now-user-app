import React from 'react'

export const EyebrowRibbon: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ position: 'relative', padding: '14px 74px' }}>
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <path d="M0 4 H400 L376 30 L400 56 H0 L24 30 Z" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
    <div style={{ position: 'relative' }}>{children}</div>
  </div>
)

export const EyebrowSeal: React.FC<{ color: string }> = ({ color }) => (
  <svg width="46" height="46" viewBox="0 0 46 46">
    <circle cx="23" cy="23" r="21" fill="none" stroke={color} strokeWidth="1.4" />
    <path d="M23 6 L27 17 L38 13 L31 23 L38 33 L27 29 L23 40 L19 29 L8 33 L15 23 L8 13 L19 17 Z" fill={color} opacity="0.85" />
  </svg>
)

export const EyebrowSwash: React.FC<{ color: string }> = ({ color }) => (
  <svg width="220" height="22" viewBox="0 0 220 22">
    <path d="M4 14 C50 2 80 22 110 11 C140 0 170 20 216 8" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="110" cy="11" r="3" fill={color} />
  </svg>
)

export const Crescent: React.FC<{ color: string; size?: number }> = ({ color, size = 30 }) => {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 30 30">
      <mask id={`c${id}`}>
        <rect width="30" height="30" fill="white" />
        <circle cx="19" cy="12" r="10" fill="black" />
      </mask>
      <circle cx="14" cy="15" r="12" fill={color} mask={`url(#c${id})`} />
      <path d="M24 4 L25 7 L28 7 L25.5 9 L26.5 12 L24 10 L21.5 12 L22.5 9 L20 7 L23 7 Z" fill={color} />
    </svg>
  )
}
