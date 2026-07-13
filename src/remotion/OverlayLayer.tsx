import React from 'react'
import type { OverlayStyle } from '@/lib/types'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const v = parseInt(hex.replace('#', ''), 16)
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
}

export const OverlayLayer: React.FC<{
  style: OverlayStyle
  color: string
  opacity: number
  width: number
  height: number
}> = ({ style, color, opacity, width, height }) => {
  if (style === 'none') return null

  const { r, g, b } = hexToRgb(color)
  const alpha = Math.round(opacity / 100 * 255)
  const rgb = `${r},${g},${b}`

  let background = ''

  switch (style) {
    case 'solid':
      background = `rgba(${rgb},${alpha})`
      break
    case 'bottom-gradient':
      background = `linear-gradient(180deg, rgba(${rgb},0) 0%, rgba(${rgb},${Math.round(alpha * 0.5)}) 55%, rgba(${rgb},${alpha}) 100%)`
      break
    case 'top-gradient':
      background = `linear-gradient(180deg, rgba(${rgb},${alpha}) 0%, rgba(${rgb},${Math.round(alpha * 0.5)}) 55%, rgba(${rgb},0) 100%)`
      break
    case 'vignette':
      background = `radial-gradient(ellipse at center, rgba(${rgb},0) 35%, rgba(${rgb},${Math.round(alpha * 0.55)}) 75%, rgba(${rgb},${alpha}) 100%)`
      break
    case 'center-focus':
      background = `radial-gradient(ellipse at center, rgba(${rgb},${alpha}) 0%, rgba(${rgb},${Math.round(alpha * 0.5)}) 45%, rgba(${rgb},0) 80%)`
      break
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background,
        pointerEvents: 'none',
      }}
    />
  )
}
