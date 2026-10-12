import React from 'react'
import { withAlpha } from '@/lib/color'
import type { SlideSequence } from './layout'

interface ProgressTicksProps {
  sequences: SlideSequence[]
  frame: number
  durationInFrames: number
  trackHeight: number
  tickWidth: number
  accent: string
  text: string
}

export const ProgressTicks: React.FC<ProgressTicksProps> = ({ sequences, frame, durationInFrames, trackHeight, tickWidth, accent, text }) => (
  <>
    {sequences.slice(1).map((sequence) => (
      <div
        key={sequence.index}
        style={{
          position: 'absolute',
          top: -trackHeight * 0.5,
          left: `${(sequence.from / durationInFrames) * 100}%`,
          width: tickWidth,
          height: trackHeight * 2,
          borderRadius: 2,
          background: frame >= sequence.from ? accent : withAlpha(text, 0.35),
        }}
      />
    ))}
  </>
)
