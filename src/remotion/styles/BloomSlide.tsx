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
  const size = portrait ? width * 0.62 : height * 0.56
  return { portrait, size, left: (width - size) / 2, top: height * (portrait ? 0.27 : 0.24) }
}

export const BloomSlide: React.FC<StyleSlideProps> = ({ timing, settings, sizes, isBengali }) => {
  const { width, height } = useVideoConfig()
  const { portrait, size, left, top } = bloomLayout(width, height)
  const translationTop = top + size + height * 0.015
  const translationBottom = height * (portrait ? 0.265 : 0.04)
  const area = { maxWidth: size * 0.6, availableHeight: size * 0.5 + (height - translationTop - translationBottom) }
  const { motion, pages } = useStyleSlide(timing.slide, timing.durationInFrames, settings, sizes, area)
  const font = isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek! : displayFontStack
  const textWidth = portrait ? width * 0.7 : width * 0.6

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: motion.visibility }}>
      <div style={{ position: 'absolute', left, top, width: size, height: size }}>
        <BloomRosette audioUrl={timing.slide.audioUrl} size={size} accent={gold} />
        <div style={{ position: 'absolute', inset: size * 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <StyleArabic slide={timing.slide} settings={settings} pages={pages} motion={motion} color="#ffffff" highlightColor="#ffd27d" />
        </div>
      </div>
      <div style={{ position: 'absolute', top: translationTop, bottom: translationBottom, left: portrait ? width * 0.1 : (width - textWidth) / 2, width: textWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StyleTranslation pages={pages} color="#e9eef8" fontFamily={font} opacity={motion.translationIn} italic={!isBengali} scale={1.05} />
      </div>
    </div>
  )
}
