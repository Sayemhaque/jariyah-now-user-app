import React from 'react'
import type { SoundAnimation } from '@/lib/types'
import { BarsVisualizer } from './BarsVisualizer'
import { CircleVisualizer } from './CircleVisualizer'
import { DotsVisualizer } from './DotsVisualizer'
import { HeadphonesVisualizer } from './HeadphonesVisualizer'
import { MicVisualizer } from './MicVisualizer'
import type { VisualizerShapeProps } from './useVisualizerLevels'
import { WaveVisualizer } from './WaveVisualizer'

export const SoundAnimationView: React.FC<VisualizerShapeProps & { kind: SoundAnimation }> = ({ kind, ...props }) => {
  switch (kind) {
    case 'wave':
      return <WaveVisualizer {...props} />
    case 'circle':
      return <CircleVisualizer {...props} />
    case 'dots':
      return <DotsVisualizer {...props} />
    case 'headphones':
      return <HeadphonesVisualizer {...props} />
    case 'mic':
      return <MicVisualizer {...props} />
    case 'none':
      return null
    default:
      return <BarsVisualizer {...props} />
  }
}
