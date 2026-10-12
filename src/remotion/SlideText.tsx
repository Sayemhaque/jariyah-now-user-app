import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { textWidthFractions } from './types'
import type { computeTextSizes } from './layout'
import { useAyahPages } from './useAyahPages'
import { useReelLayout } from './reelLayout'
import type { useSlideMotion } from './useSlideMotion'
import { SlidePage } from './SlidePage'

interface SlideTextProps {
  slide: AyatSlide
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  motion: ReturnType<typeof useSlideMotion>
  width: number
  height: number
  isBengali: boolean
}

export const SlideText: React.FC<SlideTextProps> = ({ slide, settings, sizes, motion, width, height, isBengali }) => {
  const layout = useReelLayout()
  const maxWidth = width * Math.min(textWidthFractions[settings.textWidth] ?? 0.82, layout.textMaxWidth)
  const availableHeight = height * (1 - layout.textTop - layout.textBottom)
  const pages = useAyahPages(slide, settings, sizes, { maxWidth, availableHeight }, motion.timeMs)

  return (
    <div
      style={{
        position: 'absolute',
        top: height * layout.textTop,
        bottom: height * layout.textBottom,
        left: (width - maxWidth) / 2,
        width: maxWidth,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: motion.visibility,
        transform: `translateY(${(1 - motion.visibility) * sizes.minDim * 0.04}px)`,
      }}
    >
      <SlidePage
        slide={slide}
        settings={settings}
        pages={pages}
        motion={motion}
        maxWidth={maxWidth}
        dividerWidth={sizes.minDim * 0.28}
        isBengali={isBengali}
      />
    </div>
  )
}
