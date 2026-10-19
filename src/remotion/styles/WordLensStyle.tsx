import React from 'react'
import { SlideTrack } from '../SlideTrack'
import type { StyleProps } from './types'
import { WordLensSlide } from './WordLensSlide'

export const WordLensStyle: React.FC<StyleProps> = ({ sequences, settings, sizes, isBengali, width, height }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, #241446 0%, #110a26 50%, #05040d 100%)' }} />
    <div style={{ position: 'absolute', left: '50%', top: height * 0.47, width: width * 0.9, height: width * 0.9, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,196,92,.20), transparent 62%)' }} />
    {sequences.map((timing) => (
      <SlideTrack key={timing.index} timing={timing}>
        <WordLensSlide timing={timing} settings={settings} sizes={sizes} isBengali={isBengali} />
      </SlideTrack>
    ))}
  </>
)
