import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { uiFontStack } from './fontStacks'
import { useReelLayout } from './reelLayout'

export const ReciterBadge: React.FC<{ name: string; accent: string; text: string }> = ({ name, accent, text }) => {
  const frame = useCurrentFrame()
  const layout = useReelLayout()
  const { width, height, fps } = useVideoConfig()
  const unit = Math.min(width, height) / 100
  const seconds = frame / fps
  if (!name) return null

  return (
    <div style={{ position: 'absolute', top: height * layout.badgeTop, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: unit * 1.4,
          padding: `${unit * 1.1}px ${unit * 2.6}px ${unit * 1.1}px ${unit * 1.6}px`,
          borderRadius: 999,
          background: withAlpha(accent, 0.1),
          border: `1px solid ${withAlpha(accent, 0.35)}`,
          backdropFilter: `blur(${unit}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: unit * 0.35, height: unit * 2.6 }}>
          {[0, 1, 2, 3].map((bar) => (
            <div
              key={bar}
              style={{
                width: unit * 0.5,
                height: `${35 + 65 * Math.abs(Math.sin(seconds * 4 + bar * 1.3))}%`,
                borderRadius: unit,
                background: accent,
              }}
            />
          ))}
        </div>
        <span style={{ fontFamily: uiFontStack, fontSize: unit * 2.5, fontWeight: 600, color: text, letterSpacing: '0.02em' }}>
          {name}
        </span>
      </div>
    </div>
  )
}
