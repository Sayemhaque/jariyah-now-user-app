import React from 'react'
import { useVideoConfig } from 'remotion'
import { bengaliFontStacks, displayFontStack, uiFontStack } from '../fontStacks'
import { StyleArabic } from './StyleArabic'
import { StyleTranslation } from './StyleTranslation'
import { manuscriptBox, manuscriptColors as colors } from './manuscriptLayout'
import type { StyleSlideProps } from './types'
import { useStyleSlide } from './useStyleSlide'

export const ManuscriptSlide: React.FC<StyleSlideProps & { reciterName: string }> = ({ timing, settings, sizes, isBengali, reciterName }) => {
  const { width, height } = useVideoConfig()
  const box = manuscriptBox(width, height)
  const unit = Math.min(width, height) / 1080
  const top = box.height * 0.07 + unit * 180
  const bottom = box.height * 0.1
  const area = { maxWidth: box.width * 0.8, availableHeight: box.height - top - bottom }
  const { motion, pages } = useStyleSlide(timing.slide, timing.durationInFrames, settings, sizes, area)
  const font = isBengali ? bengaliFontStacks[settings.bengaliFont] ?? bengaliFontStacks.anek! : displayFontStack

  return (
    <div style={{ position: 'absolute', top: box.top, left: box.left, width: box.width, height: box.height, opacity: motion.visibility }}>
      <div style={{ position: 'absolute', top, bottom, left: '10%', right: '10%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: unit * 26 }}>
        <StyleArabic slide={timing.slide} settings={settings} pages={pages} motion={motion} color={colors.ink} highlightColor={colors.leaf} />
        <div style={{ width: '46%', height: Math.max(1, unit * 2), background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`, opacity: motion.enter }} />
        <StyleTranslation pages={pages} color="#3b2a14" fontFamily={font} opacity={motion.translationIn} italic={!isBengali} scale={1.05} />
      </div>
      <div style={{ position: 'absolute', bottom: box.height * 0.045, left: 0, right: 0, textAlign: 'center', fontFamily: uiFontStack, fontWeight: 600, fontSize: unit * 19, letterSpacing: '0.3em', color: '#8a6420' }}>
        {timing.slide.surahNumber}:{timing.slide.ayatNumber} · {reciterName.toUpperCase()}
      </div>
    </div>
  )
}
