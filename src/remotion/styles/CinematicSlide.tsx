import React from 'react'
import { Easing, interpolate, useVideoConfig } from 'remotion'
import { arabicFontStacks, bengaliFontStacks, displayFontStack } from '../fontStacks'
import { currentWord } from './activeWord'
import { fitWordSize, FocusWord } from './FocusWord'
import { StyleTranslation } from './StyleTranslation'
import type { StyleSlideProps } from './types'
import { useStyleSlide } from './useStyleSlide'

const ease = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) } as const

export const CinematicSlide: React.FC<StyleSlideProps> = ({ timing, settings, sizes, isBengali }) => {
  const { width, height } = useVideoConfig()
  const portrait = height > width
  const stageWidth = width * (portrait ? 0.7 : 0.6)
  const left = portrait ? width * 0.11 : (width - stageWidth) / 2
  const area = { maxWidth: stageWidth, availableHeight: height * (portrait ? 0.22 : 0.3) }
  const { motion, pages } = useStyleSlide(timing.slide, timing.durationInFrames, settings, { ...sizes, arabic: sizes.arabic * 0.45 }, area)
  const active = currentWord(pages.words, motion.timeMs)
  const fontFamily = arabicFontStacks[settings.arabicFont] ?? arabicFontStacks.quran!
  const focus = active ? interpolate(active.msInto, [0, 450], [0, 1], ease) : 1
  const center = height * (portrait ? 0.44 : 0.42)
  const big = active ? fitWordSize(active.word.text, Math.min(width, height) * 0.2, stageWidth) : 0
  const side = Math.min(width, height) * 0.075
  const font = isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek! : displayFontStack

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: motion.visibility }}>
      {active && (
        <div style={{ position: 'absolute', top: center - height * 0.2, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily, fontSize: Math.min(width, height) * 0.55, lineHeight: 1, color: 'rgba(255,230,180,.05)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {active.word.text}
        </div>
      )}
      <div style={{ position: 'absolute', left, width: stageWidth, top: 0, bottom: 0 }}>
        <FocusWord word={active ? pages.words[active.index - 1] : undefined} fontFamily={fontFamily} size={side} focus={0} top={center - height * 0.12} opacity={0.35} />
        <FocusWord word={active?.word} fontFamily={fontFamily} size={big} focus={focus} top={center} opacity={0.4 + 0.6 * focus} />
        <FocusWord word={active ? pages.words[active.index + 1] : undefined} fontFamily={fontFamily} size={side} focus={0} top={center + height * 0.12} opacity={0.35} />
      </div>
      <div style={{ position: 'absolute', top: height * (portrait ? 0.6 : 0.68), bottom: height * (portrait ? 0.27 : 0.05), left, width: stageWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StyleTranslation pages={pages} color="#f7ead2" fontFamily={font} opacity={motion.translationIn} scale={1.1} />
      </div>
    </div>
  )
}
