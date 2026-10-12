import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { useAudioBars } from './useAudioBars'

const halfBars = 20

interface RecitationVisualizerProps {
  audioUrl: string
  accent: string
  visibility: number
}

export const RecitationVisualizer: React.FC<RecitationVisualizerProps> = ({ audioUrl, accent, visibility }) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()
  const levels = useAudioBars(audioUrl, frame, fps, halfBars)
  const seconds = frame / fps
  const boxHeight = height * 0.085
  const barWidth = (width * 0.64) / (halfBars * 2) * 0.55
  const idle = (index: number) => 0.18 + 0.22 * Math.abs(Math.sin(seconds * 3 + index * 0.55))
  const levelAt = (index: number) => {
    const fromCenter = Math.abs(index - halfBars + 0.5) - 0.5
    const level = levels ? levels[Math.round(fromCenter)] ?? 0 : idle(index)
    return Math.max(0.08, level * (1 - (fromCenter / halfBars) * 0.35))
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: height * 0.27 - boxHeight / 2,
        left: width * 0.18,
        width: width * 0.64,
        height: boxHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: visibility,
      }}
    >
      {Array.from({ length: halfBars * 2 }, (_, index) => (
        <div
          key={index}
          style={{
            width: barWidth,
            height: `${levelAt(index) * 100}%`,
            borderRadius: barWidth,
            background: `linear-gradient(180deg, ${accent} 0%, ${withAlpha(accent, 0.35)} 100%)`,
            boxShadow: `0 0 ${barWidth * 2}px ${withAlpha(accent, 0.45)}`,
          }}
        />
      ))}
    </div>
  )
}
