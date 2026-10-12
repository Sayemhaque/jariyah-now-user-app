import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { arabicFontClass, bengaliFontClass, textSpacingFractions, textWidthFractions } from './types'
import type { computeTextSizes } from './layout'
import { useSlideMotion } from './useSlideMotion'
import { ArabicText } from './ArabicText'
import { AyatProgress } from './AyatProgress'
import { Card } from './Card'
import { GoldDivider } from './GoldDivider'
import { TranslationText } from './TranslationText'
import { TransliterationText } from './TransliterationText'

interface SlideCardProps {
  slide: AyatSlide
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  width: number
  isBengali: boolean
  durationInFrames: number
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, settings, sizes, width, isBengali, durationInFrames }) => {
  const { minDim } = sizes
  const motion = useSlideMotion(durationInFrames)
  const accent = settings.highlightColor

  return (
    <Card
      maxWidth={width * (textWidthFractions[settings.textWidth] ?? 0.82)}
      paddingTop={width * 0.04}
      paddingX={width * 0.05}
      borderRadius={minDim * 0.03}
      shadow={minDim * 0.03}
      visibility={motion.visibility}
    >
      <ArabicText
        text={slide.arabicText}
        fontSize={sizes.arabic}
        fontFace={arabicFontClass[settings.arabicFont] ?? 'Amiri'}
        color={settings.fontColor}
        highlightColor={accent}
        highlight={settings.wordHighlight ?? true}
        ayatNumber={slide.ayatNumber}
        audioDurationMs={slide.audioDurationMs}
        timeMs={motion.timeMs}
        frame={motion.frame}
      />
      <GoldDivider width={minDim * 0.32} color={accent} opacity={motion.enter} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: motion.translationIn }}>
        {settings.showTransliteration && slide.transliteration && (
          <TransliterationText text={slide.transliteration} fontSize={sizes.transliteration} maxWidth={width * 0.8} />
        )}
        {settings.showTranslation && (
          <TranslationText
            text={slide.translation}
            fontSize={sizes.translation}
            maxWidth={width * 0.85}
            isBengali={isBengali}
            bengaliFont={bengaliFontClass[settings.bengaliFont] ?? 'Noto Sans Bengali'}
            spacing={textSpacingFractions[settings.textSpacing] ?? 0.03}
          />
        )}
      </div>
      <AyatProgress progress={motion.progress} color={accent} thickness={Math.max(2, minDim * 0.004)} gap={minDim * 0.03} />
    </Card>
  )
}
