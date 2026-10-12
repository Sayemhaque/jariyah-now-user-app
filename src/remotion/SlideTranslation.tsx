import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { defaultScene } from '@/lib/backgroundPresets'
import { textSpacingFractions } from './types'
import type { computeTextSizes } from './layout'
import { bengaliFontStacks } from './fontStacks'
import { TranslationText } from './TranslationText'
import { TransliterationText } from './TransliterationText'

interface SlideTranslationProps {
  slide: AyatSlide
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  maxWidth: number
  isBengali: boolean
  opacity: number
}

export const SlideTranslation: React.FC<SlideTranslationProps> = ({ slide, settings, sizes, maxWidth, isBengali, opacity }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity }}>
    {settings.showTransliteration && slide.transliteration && (
      <TransliterationText text={slide.transliteration} fontSize={sizes.transliteration} maxWidth={maxWidth} />
    )}
    {settings.showTranslation && (
      <TranslationText
        text={slide.translation}
        fontSize={sizes.translation}
        maxWidth={maxWidth}
        fontFamily={isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek : undefined}
        spacing={textSpacingFractions[settings.textSpacing] ?? 0.03}
        color={settings.translationColor ?? defaultScene.palette.translation}
      />
    )}
  </div>
)
