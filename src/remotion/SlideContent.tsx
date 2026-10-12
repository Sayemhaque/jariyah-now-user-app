import React from 'react'
import type { VideoSettings } from '@/lib/types'
import type { computeTextSizes, SlideSequence as SlideTiming } from './layout'
import { useSlideMotion } from './useSlideMotion'
import { RecitationVisualizer } from './RecitationVisualizer'
import { SlideText } from './SlideText'

export interface SlideContentProps {
  timing: SlideTiming
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  isBengali: boolean
  width: number
  height: number
}

export const SlideContent: React.FC<SlideContentProps> = ({ timing, settings, sizes, isBengali, width, height }) => {
  const motion = useSlideMotion(timing.durationInFrames)
  return (
    <>
      <RecitationVisualizer audioUrl={timing.slide.audioUrl} accent={settings.highlightColor} visibility={motion.visibility} />
      <SlideText
        slide={timing.slide}
        settings={settings}
        sizes={sizes}
        motion={motion}
        width={width}
        height={height}
        isBengali={isBengali}
      />
    </>
  )
}
