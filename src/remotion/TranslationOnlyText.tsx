import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { textWidthFractions } from './types'
import type { computeTextSizes } from './layout'
import { bengaliFontStacks } from './fontStacks'
import { GoldDivider } from './GoldDivider'
import { TranslationText } from './TranslationText'
import { useReelLayout } from './reelLayout'
import type { useSlideMotion } from './useSlideMotion'
import { fitTranslationOnlySize } from './translationFit'

interface TranslationOnlyTextProps {
  slide: AyatSlide
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  motion: ReturnType<typeof useSlideMotion>
  width: number
  height: number
  isBengali: boolean
}

export const TranslationOnlyText: React.FC<TranslationOnlyTextProps> = ({ slide, settings, sizes, motion, width, height, isBengali }) => {
  const layout = useReelLayout()
  const maxWidth = width * Math.min(textWidthFractions[settings.textWidth] ?? 0.82, layout.textMaxWidth)
  const availableHeight = height * (1 - layout.textTop - layout.textBottom)
  const fontSize = fitTranslationOnlySize(slide.translation, sizes.translation, maxWidth, availableHeight)

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
        gap: fontSize * 0.6,
        opacity: motion.visibility,
        transform: `translateY(${(1 - motion.visibility) * sizes.minDim * 0.04}px)`,
      }}
    >
      <GoldDivider width={sizes.minDim * 0.18} color={settings.highlightColor} opacity={motion.enter} />
      <TranslationText
        text={slide.translation}
        fontSize={fontSize}
        maxWidth={maxWidth}
        fontFamily={isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek : undefined}
        spacing={0}
        color={settings.fontColor}
      />
      <GoldDivider width={sizes.minDim * 0.18} color={settings.highlightColor} opacity={motion.enter} />
    </div>
  )
}
