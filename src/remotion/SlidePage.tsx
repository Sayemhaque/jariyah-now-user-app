import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import type { useAyahPages } from './useAyahPages'
import type { useSlideMotion } from './useSlideMotion'
import { arabicFontStacks } from './fontStacks'
import { ArabicText } from './ArabicText'
import { GoldDivider } from './GoldDivider'
import { SlideTranslation } from './SlideTranslation'

interface SlidePageProps {
  slide: AyatSlide
  settings: VideoSettings
  pages: ReturnType<typeof useAyahPages>
  motion: ReturnType<typeof useSlideMotion>
  maxWidth: number
  dividerWidth: number
  isBengali: boolean
}

export const SlidePage: React.FC<SlidePageProps> = ({ slide, settings, pages, motion, maxWidth, dividerWidth, isBengali }) => {
  const { words, page, isLastPage, state, fitted, minHeights } = pages
  const accent = settings.highlightColor
  const pageStyle = { width: '100%', opacity: state.opacity, transform: `translateY(${state.shift * fitted.arabic * 0.35}px)` }

  return (
    <>
      <div style={{ ...pageStyle, minHeight: minHeights.arabic, display: 'flex', alignItems: 'center' }}>
        <ArabicText
          words={words}
          start={page.start}
          end={page.end}
          showNumber={isLastPage}
          fontSize={fitted.arabic}
          fontFamily={arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!}
          color={settings.fontColor}
          highlightColor={accent}
          highlight={settings.wordHighlight ?? true}
          ayatNumber={slide.ayatNumber}
          timeMs={motion.timeMs}
          frame={motion.frame}
        />
      </div>
      <GoldDivider width={dividerWidth} color={accent} opacity={motion.enter} />
      <div style={{ ...pageStyle, minHeight: minHeights.translation, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <SlideTranslation
          translation={page.translation}
          transliteration={page.transliteration}
          settings={settings}
          sizes={fitted}
          maxWidth={maxWidth}
          isBengali={isBengali}
          opacity={motion.translationIn}
        />
      </div>
    </>
  )
}
