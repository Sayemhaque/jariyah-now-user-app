import React from 'react'
import { uiFontStack } from '../fontStacks'
import { SlideTrack } from '../SlideTrack'
import { CinematicSlide } from './CinematicSlide'
import type { StyleProps } from './types'

const rays = 'conic-gradient(from 168deg at 50% 0%, transparent 0deg, rgba(255,226,170,.16) 6deg, transparent 12deg, rgba(255,226,170,.10) 18deg, transparent 24deg)'
const haze = 'radial-gradient(ellipse at 50% 30%, rgba(255,200,120,.18), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(60,40,120,.35), transparent 60%)'

export const CinematicStyle: React.FC<StyleProps> = ({ sequences, settings, sizes, isBengali, width, height, titles }) => {
  const unit = Math.min(width, height) / 1080
  const label = (top: number, size: number, spacing: string, color: string, text: string) => (
    <div style={{ position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: uiFontStack, fontWeight: 500, fontSize: unit * size, letterSpacing: spacing, color }}>{text}</div>
  )
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: '#040406' }} />
      <div style={{ position: 'absolute', left: '50%', top: -height * 0.15, width: Math.max(width, height) * 1.2, height: Math.max(width, height) * 1.2, transform: 'translateX(-50%)', background: rays, filter: `blur(${unit * 18}px)` }} />
      <div style={{ position: 'absolute', inset: 0, background: haze }} />
      {sequences.map((timing) => (
        <SlideTrack key={timing.index} timing={timing}>
          <CinematicSlide timing={timing} settings={settings} sizes={sizes} isBengali={isBengali} />
        </SlideTrack>
      ))}
      {label(height * (height > width ? 0.185 : 0.17), 26, '0.7em', 'rgba(255,232,190,.75)', titles.surahName.toUpperCase())}
      {label(height * (height > width ? 0.215 : 0.215), 20, '0.35em', 'rgba(255,255,255,.45)', titles.reciterName.toUpperCase())}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: `${unit * 3}px ${unit * 3}px` }} />
    </>
  )
}
