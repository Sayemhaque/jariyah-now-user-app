import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import type { ScenePalette } from '@/lib/backgroundPresets'
import { withAlpha } from '@/lib/color'

const tile = 120
const tilePath = (() => {
  const c = tile / 2
  const outer = Array.from({ length: 16 }, (_, i) => {
    const angle = (Math.PI / 8) * i + Math.PI / 8
    const r = i % 2 ? c * 0.55 : c * 0.78
    return `${(c + Math.cos(angle) * r).toFixed(1)},${(c + Math.sin(angle) * r).toFixed(1)}`
  })
  return `M${outer.join(' L')} Z M0,${c} L${tile},${c} M${c},0 L${c},${tile}`
})()

export const GoldLattice: React.FC<{ palette: ScenePalette }> = ({ palette }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const seconds = frame / fps
  const scale = Math.min(width, height) / 1080
  const sweep = (seconds * 0.06) % 1.6 - 0.3
  const lightX = width * (0.1 + sweep * 0.8)
  const lightY = height * (0.15 + sweep * 0.7)

  return (
    <>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="gold-lattice" width={tile * scale} height={tile * scale} patternUnits="userSpaceOnUse">
            <path d={tilePath} transform={`scale(${scale})`} fill="none" stroke={palette.pattern} strokeWidth={1.1} />
          </pattern>
          <radialGradient id="lattice-light" cx={lightX} cy={lightY} r={Math.max(width, height) * 0.55} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.06" />
          </radialGradient>
          <mask id="lattice-mask">
            <rect width={width} height={height} fill="url(#lattice-light)" />
          </mask>
        </defs>
        <rect width={width} height={height} fill="url(#gold-lattice)" mask="url(#lattice-mask)" opacity={0.35} />
      </svg>
      <div style={{ position: 'absolute', left: lightX - width * 0.6, top: lightY - width * 0.6, width: width * 1.2, height: width * 1.2, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(palette.accent, 0.14)} 0%, transparent 60%)` }} />
    </>
  )
}
