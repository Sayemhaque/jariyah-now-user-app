import React from 'react'
import type { VideoStyle } from '@/lib/types'
import { BloomStyle } from './BloomStyle'
import { CinematicStyle } from './CinematicStyle'
import { ManuscriptStyle } from './ManuscriptStyle'
import type { StyleProps } from './types'
import { VisualizerStyle } from './VisualizerStyle'
import { WordLensStyle } from './WordLensStyle'

export const VideoStyleView: React.FC<StyleProps & { videoStyle?: VideoStyle }> = ({ videoStyle, ...props }) => {
  switch (videoStyle) {
    case 'manuscript':
      return <ManuscriptStyle {...props} />
    case 'wordlens':
      return <WordLensStyle {...props} />
    case 'cinematic':
      return <CinematicStyle {...props} />
    case 'bloom':
      return <BloomStyle {...props} />
    default:
      return <VisualizerStyle {...props} />
  }
}
