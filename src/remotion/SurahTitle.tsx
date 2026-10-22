import React from 'react'
import { useCurrentFrame, useVideoConfig, spring } from 'remotion'
import { withAlpha } from '@/lib/color'
import { isBengaliText } from '@/lib/cards/cardTypography'
import { bengaliFontStacks, headerArabicStack, uiFontStack } from './fontStacks'
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
  const banglaMeaning = meaning && isBengaliText(meaning) ? meaning : undefined
  const subtitle = [englishName, banglaMeaning ? undefined : meaning].filter(Boolean).join(' · ')
  const sides = layout.headerAlign === 'sides'
  const placement = sides ? { left: width * layout.sideInset, alignItems: 'flex-start' as const } : { left: 0, right: 0, alignItems: 'center' as const }

  return (
    <div
      style={{
        position: 'absolute',
        top: height * layout.titleTop,
        ...placement,
        display: 'flex',
        flexDirection: 'column',
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
        }}
      >
        {arabicName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: unit * 1.6, width: sides ? 'auto' : '80%', justifyContent: 'center' }}>
        {!sides && <div style={{ ...line, background: `linear-gradient(90deg, transparent, ${accent})` }} />}
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
      {banglaMeaning && (
        <div style={{ marginTop: unit * 1.2, fontFamily: bengaliFontStacks.sans, fontSize: unit * 3.6, fontWeight: 600, lineHeight: 1.35, color: text, textAlign: sides ? 'left' : 'center', maxWidth: width * 0.84, textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}>
          {banglaMeaning}
        </div>
      )}
    </div>
  )
}
