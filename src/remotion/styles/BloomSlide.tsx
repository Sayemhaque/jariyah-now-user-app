import React from 'react'
import { useVideoConfig } from 'remotion'
import { bengaliFontStacks, displayFontStack } from '../fontStacks'
import { BloomRosette } from './BloomRosette'
import { StyleArabic } from './StyleArabic'
import { StyleTranslation } from './StyleTranslation'
import type { StyleSlideProps } from './types'
import { useStyleSlide } from './useStyleSlide'

const gold = '#c9973a'

export function bloomLayout(width: number, height: number) {
  const portrait = height > width
  if (portrait) {
    const size = width * 0.62
    const top = height * 0.27
    return { size, left: (width - size) / 2, top, text: { top: top + size + height * 0.015, bottom: height * 0.265, left: width * 0.1, width: width * 0.7 } }
  }
  const size = height * 0.7
  return { size, left: width * 0.1, top: height * 0.19, text: { top: height * 0.4, bottom: height * 0.16, left: width * 0.52, width: width * 0.4 } }
}

export const BloomSlide: React.FC<StyleSlideProps> = ({ timing, settings, sizes, isBengali }) => {
  const { width, height } = useVideoConfig()
  const { size, left, top, text } = bloomLayout(width, height)
  const area = { maxWidth: size * 0.6, availableHeight: size * 0.5 + (height - text.top - text.bottom) }
  const { motion, pages } = useStyleSlide(timing.slide, timing.durationInFrames, settings, sizes, area)
  const font = isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek! : displayFontStack

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: motion.visibility }}>
      <div style={{ position: 'absolute', left, top, width: size, height: size }}>
        <BloomRosette audioUrl={timing.slide.audioUrl} size={size} accent={gold} />
        <div style={{ position: 'absolute', inset: size * 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyleArabic slide={timing.slide} settings={settings} pages={pages} motion={motion} color="#ffffff" highlightColor="#ffd27d" />
        </div>
      </div>
      <div style={{ position: 'absolute', ...text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StyleTranslation pages={pages} color="#e9eef8" fontFamily={font} opacity={motion.translationIn} italic={!isBengali} scale={1.05} />
      </div>
    </div>
  )
}
