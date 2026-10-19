import React from 'react'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { ArabicText } from '../ArabicText'
import { arabicFontStacks } from '../fontStacks'
import type { useAyahPages } from '../useAyahPages'
import type { useSlideMotion } from '../useSlideMotion'
import { pageMotionStyle } from './useStyleSlide'

interface StyleArabicProps {
  slide: AyatSlide
  settings: VideoSettings
  pages: ReturnType<typeof useAyahPages>
  motion: ReturnType<typeof useSlideMotion>
  color: string
  highlightColor: string
}

export const StyleArabic: React.FC<StyleArabicProps> = ({ slide, settings, pages, motion, color, highlightColor }) => (
  <div style={{ ...pageMotionStyle(pages), width: '100%', minHeight: pages.minHeights.arabic, display: 'flex', alignItems: 'center' }}>
    <ArabicText
      words={pages.words}
      start={pages.page.start}
      end={pages.page.end}
      showNumber={pages.isLastPage}
      fontSize={pages.fitted.arabic}
      fontFamily={arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!}
      color={color}
      highlightColor={highlightColor}
      highlight={settings.wordHighlight ?? true}
      ayatNumber={slide.ayatNumber}
      timeMs={motion.timeMs}
      frame={motion.frame}
    />
  </div>
)
