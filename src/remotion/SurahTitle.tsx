import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { withAlpha } from '@/lib/color'
import { headerArabicStack, uiFontStack } from './fontStacks'
import { useReelLayout } from './reelLayout'

interface SurahTitleProps {
  arabicName: string
  englishName: string
  meaning?: string
  accent: string
  text: string
}

export const SurahTitle: React.FC<SurahTitleProps> = ({ arabicName, englishName, meaning, accent, text }) => {
  const frame = useCurrentFrame()
  const layout = useReelLayout()
  const { width, height, fps } = useVideoConfig()
  const unit = Math.min(width, height) / 100
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: Math.round(fps * 0.9) })
  const line = { flex: 1, height: 1, maxWidth: unit * 12 }
  const subtitle = [englishName, meaning].filter(Boolean).join(' · ')

  return (
    <div
      style={{
        position: 'absolute',
        top: height * layout.titleTop,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: enter,
        transform: `translateY(${(1 - enter) * -unit * 3}px)`,
      }}
    >
      <div
        lang="ar"
        style={{
          fontFamily: headerArabicStack,
          fontWeight: 700,
          fontSize: unit * 9,
          lineHeight: 1.25,
          color: accent,
          textShadow: `0 0 ${unit * 3}px ${withAlpha(accent, 0.55)}, 0 2px 8px rgba(0,0,0,0.5)`,
        }}
      >
        {arabicName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: unit * 1.6, width: '80%', justifyContent: 'center' }}>
        <div style={{ ...line, background: `linear-gradient(90deg, transparent, ${accent})` }} />
        <span
          style={{
            fontFamily: uiFontStack,
            fontSize: unit * 2.3,
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: withAlpha(text, 0.85),
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </span>
        <div style={{ ...line, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      </div>
    </div>
  )
}
