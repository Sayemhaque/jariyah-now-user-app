import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { arabicFontClass, bengaliFontClass, textSpacingFractions, textWidthFractions } from './types'
import type { computeTextSizes } from './layout'
import { ArabicText } from './ArabicText'
import { Card } from './Card'
import { TranslationText } from './TranslationText'
import { TransliterationText } from './TransliterationText'

interface SlideCardProps {
  slide: AyatSlide
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  width: number
  isBengali: boolean
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, settings, sizes, width, isBengali }) => {
  const { minDim } = sizes
  return (
    <Card
      maxWidth={width * (textWidthFractions[settings.textWidth] ?? 0.82)}
      paddingTop={width * 0.04}
      paddingX={width * 0.05}
      borderRadius={minDim * 0.03}
      shadow={minDim * 0.03}
    >
      <ArabicText
        text={slide.arabicText}
        fontSize={sizes.arabic}
        fontFace={arabicFontClass[settings.arabicFont] ?? 'Amiri'}
        color={settings.fontColor}
      />
      {settings.showTranslation && settings.showTransliteration && slide.arabicText && (
        <div
          style={{
            marginTop: minDim * 0.015,
            marginBottom: minDim * 0.015,
            height: 1,
            width: minDim * 0.12,
            opacity: 0.4,
            backgroundColor: settings.fontColor,
          }}
        />
      )}
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
    </Card>
  )
}
