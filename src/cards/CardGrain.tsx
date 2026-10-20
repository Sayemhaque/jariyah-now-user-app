import React from 'react'

export const CardGrain: React.FC<{ width: number; height: number; opacity: number; light: boolean }> = ({ width, height, opacity, light }) => {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity, mixBlendMode: light ? 'multiply' : 'screen' }}>
      <filter id={`grain${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={width} height={height} filter={`url(#grain${id})`} />
    </svg>
  )
}
