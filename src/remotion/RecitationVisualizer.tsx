import React from 'react'
import { useVideoConfig } from 'remotion'
import type { SoundAnimation } from '@/lib/types'
import { useReelLayout } from './reelLayout'
import { SoundAnimationView } from './visualizers/SoundAnimationView'

interface RecitationVisualizerProps {
  audioUrl: string
  accent: string
  visibility: number
  kind?: SoundAnimation
}

export const RecitationVisualizer: React.FC<RecitationVisualizerProps> = ({ audioUrl, accent, visibility, kind = 'bars' }) => {
  const { width, height } = useVideoConfig()
  const layout = useReelLayout()
  const boxHeight = height * layout.visualizerHeight
  const boxWidth = width * layout.visualizerWidth

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
        justifyContent: 'center',
        opacity: visibility,
      }}
    >
      <SoundAnimationView kind={kind} audioUrl={audioUrl} accent={accent} width={boxWidth} height={boxHeight} />
    </div>
  )
}
