import React from 'react'
import { SlideTrack } from '../SlideTrack'
import { ManuscriptFrame } from './ManuscriptFrame'
import { ManuscriptHeader } from './ManuscriptHeader'
import { ManuscriptSlide } from './ManuscriptSlide'
import { manuscriptBox, manuscriptColors as colors } from './manuscriptLayout'
import type { StyleProps } from './types'

const lattice = 'repeating-linear-gradient(45deg, #d9b45a 0 1px, transparent 1px 38px), repeating-linear-gradient(-45deg, #d9b45a 0 1px, transparent 1px 38px)'

export const ManuscriptStyle: React.FC<StyleProps> = ({ sequences, settings, sizes, isBengali, width, height, titles }) => {
  const box = manuscriptBox(width, height)
  const unit = Math.min(width, height) / 1080
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: colors.backdrop }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: lattice, backgroundSize: `${unit * 54}px ${unit * 54}px` }} />
      <div
        style={{
          position: 'absolute',
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          borderRadius: unit * 6,
          background: colors.parchment,
          boxShadow: `inset 0 0 ${unit * 120}px rgba(150,105,30,.35)`,
        }}
      >
        <ManuscriptFrame unit={unit} />
        <ManuscriptHeader unit={unit} pageHeight={box.height} arabicName={titles.surahNameArabic} englishName={titles.surahName} meaning={titles.surahMeaning} />
      </div>
      {sequences.map((timing) => (
        <SlideTrack key={timing.index} timing={timing}>
          <ManuscriptSlide timing={timing} settings={settings} sizes={sizes} isBengali={isBengali} reciterName={titles.reciterName} />
        </SlideTrack>
      ))}
    </>
  )
}
