import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { formatMs } from '@/lib/format'
import type { SlideSequence } from './layout'
import { uiFontStack } from './fontStacks'
import { ProgressTicks } from './ProgressTicks'
import { useReelLayout } from './reelLayout'

interface ReelProgressProps {
  sequences: SlideSequence[]
  accent: string
  text: string
}

export const ReelProgress: React.FC<ReelProgressProps> = ({ sequences, accent, text }) => {
  const frame = useCurrentFrame()
  const layout = useReelLayout()
  const { width, height, fps, durationInFrames } = useVideoConfig()
  const unit = Math.min(width, height) / 100
  const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1))
  const current = [...sequences].reverse().find((s) => frame >= s.from) ?? sequences[0]
  const trackHeight = Math.max(3, unit * 0.6)
  const label = { fontFamily: uiFontStack, fontSize: unit * 2.1, fontWeight: 600, color: withAlpha(text, 0.75), letterSpacing: '0.12em' }

  return (
    <div style={{ position: 'absolute', left: width * layout.progressInset, right: width * layout.progressInset, bottom: height * layout.progressBottom, display: 'grid', gap: unit * 1.2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={label}>{current ? `AYAH ${current.slide.surahNumber}:${current.slide.ayatNumber}` : ''}</span>
        <span style={{ ...label, fontVariantNumeric: 'tabular-nums' }}>
          {formatMs((frame / fps) * 1000)} / {formatMs((durationInFrames / fps) * 1000)}
        </span>
      </div>
      <div style={{ position: 'relative', height: trackHeight, borderRadius: trackHeight, background: withAlpha(text, 0.15) }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            borderRadius: trackHeight,
            background: `linear-gradient(90deg, ${withAlpha(accent, 0.6)}, ${accent})`,
            boxShadow: `0 0 ${unit * 1.5}px ${withAlpha(accent, 0.7)}`,
          }}
        />
        <ProgressTicks
          sequences={sequences}
          frame={frame}
          durationInFrames={durationInFrames}
          trackHeight={trackHeight}
          tickWidth={Math.max(2, unit * 0.35)}
          accent={accent}
          text={text}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${progress * 100}%`,
            width: trackHeight * 3.2,
            height: trackHeight * 3.2,
            borderRadius: '50%',
            background: accent,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${unit * 2}px ${accent}`,
          }}
        />
      </div>
    </div>
  )
}
