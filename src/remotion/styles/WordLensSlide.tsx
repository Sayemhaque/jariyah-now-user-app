import React from 'react'
import { useVideoConfig } from 'remotion'
import { arabicFontStacks, bengaliFontStacks, uiFontStack } from '../fontStacks'
import { currentWord } from './activeWord'
import { StyleArabic } from './StyleArabic'
import { StyleTranslation } from './StyleTranslation'
import type { StyleSlideProps } from './types'
import { useStyleSlide } from './useStyleSlide'
import { WordCard } from './WordCard'
import { wordLensZones, type Zone } from './wordLensLayout'

const accent = '#ffd27d'

export const WordLensSlide: React.FC<StyleSlideProps> = ({ timing, settings, sizes, isBengali }) => {
  const { width, height } = useVideoConfig()
  const unit = Math.min(width, height) / 1080
  const zones = wordLensZones(width, height)
  const small = { ...sizes, arabic: sizes.arabic * zones.arabicScale, translation: sizes.translation * 0.85 }
  const area = { maxWidth: zones.ayah.width * 0.92, availableHeight: zones.ayah.height + zones.translation.height }
  const { motion, pages } = useStyleSlide(timing.slide, timing.durationInFrames, settings, small, area)
  const active = currentWord(pages.words, motion.timeMs)
  const font = isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek! : uiFontStack
  const caption = `${timing.slide.surahNumber}:${timing.slide.ayatNumber}`
  const column = (z: Zone): React.CSSProperties => ({ position: 'absolute', ...z, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: motion.visibility }}>
      <div style={column(zones.ayah)}>
        <StyleArabic slide={timing.slide} settings={settings} pages={pages} motion={motion} color="rgba(255,255,255,.55)" highlightColor={accent} />
      </div>
      <div style={column(zones.card)}>
        {active && (
          <WordCard word={active.word} index={active.index} total={pages.words.length} msInto={active.msInto} unit={unit} accent={accent} caption={caption}
            fontFamily={arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!} />
        )}
      </div>
      <div style={column(zones.translation)}>
        <StyleTranslation pages={pages} color="rgba(255,255,255,.92)" fontFamily={font} opacity={motion.translationIn} />
      </div>
    </div>
  )
}
