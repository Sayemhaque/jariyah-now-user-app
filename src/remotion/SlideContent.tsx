import React from 'react'
import type { VideoSettings } from '@/lib/types'
import type { computeTextSizes, SlideSequence as SlideTiming } from './layout'
import { useSlideMotion } from './useSlideMotion'
import { RecitationVisualizer } from './RecitationVisualizer'
import { SlideText } from './SlideText'
import { TranslationOnlyText } from './TranslationOnlyText'

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
  const textProps = { slide: timing.slide, settings, sizes, motion, width, height, isBengali }
  return (
    <>
      {timing.slide.audioUrl && <RecitationVisualizer audioUrl={timing.slide.audioUrl} accent={settings.highlightColor} visibility={motion.visibility} kind={settings.soundAnimation} />}
      {timing.slide.arabicText ? <SlideText {...textProps} /> : <TranslationOnlyText {...textProps} />}
    </>
  )
}
