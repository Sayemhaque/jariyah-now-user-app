import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { withAlpha } from '@/lib/color'
import { useAudioBars } from './useAudioBars'
import { useReelLayout } from './reelLayout'

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
  const layout = useReelLayout()
  const boxHeight = height * layout.visualizerHeight
  const boxWidth = width * layout.visualizerWidth
  const barWidth = (boxWidth / (halfBars * 2)) * 0.55
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
        top: height * layout.visualizerCenter - boxHeight / 2,
        left: (width - boxWidth) / 2,
        width: boxWidth,
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
          }}
        />
      ))}
    </div>
  )
}
