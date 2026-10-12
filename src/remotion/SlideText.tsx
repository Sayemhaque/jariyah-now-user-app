import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { textWidthFractions } from './types'
import { fittedSizes, type computeTextSizes } from './layout'
import { useReelLayout } from './reelLayout'
import type { useSlideMotion } from './useSlideMotion'
import { arabicFontStacks } from './fontStacks'
import { ArabicText } from './ArabicText'
import { GoldDivider } from './GoldDivider'
import { SlideTranslation } from './SlideTranslation'

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
  const accent = settings.highlightColor
  const layout = useReelLayout()
  const maxWidth = width * Math.min(textWidthFractions[settings.textWidth] ?? 0.82, layout.textMaxWidth)
  const availableHeight = height * (1 - layout.textTop - layout.textBottom)
  const fitted = fittedSizes(slide, settings, sizes, maxWidth, availableHeight)

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
      <ArabicText
        text={slide.arabicText}
        timedWords={slide.words}
        fontSize={fitted.arabic}
        fontFamily={arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!}
        color={settings.fontColor}
        highlightColor={accent}
        highlight={settings.wordHighlight ?? true}
        ayatNumber={slide.ayatNumber}
        audioDurationMs={slide.audioDurationMs}
        timeMs={motion.timeMs}
        frame={motion.frame}
      />
      <GoldDivider width={sizes.minDim * 0.28} color={accent} opacity={motion.enter} />
      <SlideTranslation
        slide={slide}
        settings={settings}
        sizes={fitted}
        maxWidth={maxWidth}
        isBengali={isBengali}
        opacity={motion.translationIn}
      />
    </div>
  )
}
