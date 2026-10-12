import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { textSpacingFractions, textWidthFractions } from './types'
import type { computeTextSizes } from './layout'
import { arabicFontStacks, bengaliFontStacks } from './fontStacks'
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
      paddingTop={width * 0.03}
      paddingX={width * 0.03}
      glow={minDim * 0.08}
      visibility={motion.visibility}
    >
      <ArabicText
        text={slide.arabicText}
        timedWords={slide.words}
        fontSize={sizes.arabic}
        fontFamily={arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!}
        color={settings.fontColor}
        highlightColor={accent}
        highlight={settings.wordHighlight ?? true}
        ayatNumber={slide.ayatNumber}
        audioDurationMs={slide.audioDurationMs}
        timeMs={motion.timeMs}
        frame={motion.frame}
      />
      <GoldDivider width={minDim * 0.3} color={accent} opacity={motion.enter} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: motion.translationIn }}>
        {settings.showTransliteration && slide.transliteration && (
          <TransliterationText text={slide.transliteration} fontSize={sizes.transliteration} maxWidth={width * 0.8} />
        )}
        {settings.showTranslation && (
          <TranslationText
            text={slide.translation}
            fontSize={sizes.translation}
            maxWidth={width * 0.85}
            fontFamily={isBengali ? bengaliFontStacks[settings.bengaliFont] : undefined}
            spacing={textSpacingFractions[settings.textSpacing] ?? 0.03}
          />
        )}
      </div>
      <AyatProgress progress={motion.progress} color={accent} thickness={Math.max(2, minDim * 0.003)} width={minDim * 0.36} gap={minDim * 0.035} />
    </Card>
  )
}
