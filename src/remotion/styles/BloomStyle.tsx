import React from 'react'
import { headerArabicStack, uiFontStack } from '../fontStacks'
import { SlideTrack } from '../SlideTrack'
import { BloomSlide } from './BloomSlide'
import type { StyleProps } from './types'

export const BloomStyle: React.FC<StyleProps> = ({ sequences, settings, sizes, isBengali, width, height, titles }) => {
  const unit = Math.min(width, height) / 1080
  const portrait = height > width
  const header: React.CSSProperties = portrait ? { top: height * 0.18, left: 0, right: 0 } : { top: height * 0.22, left: width * 0.52, width: width * 0.4 }
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #10233f 0%, #081426 55%, #030810 100%)' }} />
      <div style={{ position: 'absolute', ...header, textAlign: 'center' }}>
        <div style={{ fontFamily: headerArabicStack, fontWeight: 700, fontSize: unit * 60, lineHeight: 1.3, color: '#f2d48a', direction: 'rtl' }}>{titles.surahNameArabic}</div>
        <div style={{ fontFamily: uiFontStack, fontWeight: 600, fontSize: unit * 19, letterSpacing: '0.45em', color: 'rgba(242,212,138,.7)' }}>
          {[titles.surahName, titles.reciterName].join(' · ').toUpperCase()}
        </div>
      </div>
      {sequences.map((timing) => (
        <SlideTrack key={timing.index} timing={timing}>
          <BloomSlide timing={timing} settings={settings} sizes={sizes} isBengali={isBengali} />
        </SlideTrack>
      ))}
    </>
  )
}
