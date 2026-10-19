import React from 'react'
import { useVideoConfig } from 'remotion'
import { arabicFontStacks, bengaliFontStacks, uiFontStack } from '../fontStacks'
import { currentWord } from './activeWord'
import { StyleArabic } from './StyleArabic'
import { StyleTranslation } from './StyleTranslation'
import type { StyleSlideProps } from './types'
import { useStyleSlide } from './useStyleSlide'
import { WordCard } from './WordCard'

const accent = '#ffd27d'

export const WordLensSlide: React.FC<StyleSlideProps> = ({ timing, settings, sizes, isBengali }) => {
  const { width, height } = useVideoConfig()
  const portrait = height > width
  const unit = Math.min(width, height) / 1080
  const left = portrait ? width * 0.09 : width * 0.2
  const boxWidth = portrait ? width * 0.75 : width * 0.6
  const small = { ...sizes, arabic: sizes.arabic * 0.55, translation: sizes.translation * 0.85 }
  const area = { maxWidth: boxWidth * 0.92, availableHeight: height * (portrait ? 0.24 : 0.3) }
  const { motion, pages } = useStyleSlide(timing.slide, timing.durationInFrames, settings, small, area)
  const active = currentWord(pages.words, motion.timeMs)
  const font = isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek! : uiFontStack
  const caption = `${timing.slide.surahNumber}:${timing.slide.ayatNumber}`
  const column = (top: number, bottom: number): React.CSSProperties => ({ position: 'absolute', top: height * top, bottom: height * bottom, left, width: boxWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: motion.visibility }}>
      <div style={column(portrait ? 0.18 : 0.15, portrait ? 0.72 : 0.7)}>
        <StyleArabic slide={timing.slide} settings={settings} pages={pages} motion={motion} color="rgba(255,255,255,.55)" highlightColor={accent} />
      </div>
      <div style={{ ...column(portrait ? 0.29 : 0.31, portrait ? 0.42 : 0.24) }}>
        {active && (
          <WordCard word={active.word} index={active.index} total={pages.words.length} msInto={active.msInto} unit={unit} accent={accent} caption={caption}
            fontFamily={arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!} />
        )}
      </div>
      <div style={column(portrait ? 0.6 : 0.78, portrait ? 0.265 : 0.04)}>
        <StyleTranslation pages={pages} color="rgba(255,255,255,.92)" fontFamily={font} opacity={motion.translationIn} />
      </div>
    </div>
  )
}
