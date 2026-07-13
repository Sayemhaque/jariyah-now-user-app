import React from 'react'
import { registerRoot, Composition } from 'remotion'
import { AyatVideo } from './AyatVideo'
import type { AyatVideoProps } from './types'
import { RES } from './types'

const defaultProps: AyatVideoProps = {
  slides: [],
  settings: {
    backgroundImage: '/backgrounds/twilight-mosque-portrait.png',
    backgroundPreset: 'twilight-mosque',
    overlayStyle: 'bottom-gradient',
    overlayColor: '#000000',
    overlayOpacity: 55,
    fontColor: '#ffffff',
    highlightColor: '#9333ea',
    arabicFontSize: 30,
    translationFontSize: 14,
    fontStyle: 'uthmani',
    arabicFont: 'uthmani',
    bengaliFont: 'sans',
    useTajweed: false,
    showTranslation: true,
    showTransliteration: false,
    orientation: 'portrait',
    autoFitFonts: true,
    textWidth: 'wide',
    textSpacing: 'normal',
  },
  orientation: 'portrait',
  reciterName: '',
  attributionLine: '',
  surahName: '',
  surahNameArabic: '',
  totalAyats: 0,
  isExport: false,
}

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AyatVideo"
        component={AyatVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={30}
        fps={30}
        width={RES.portrait.w}
        height={RES.portrait.h}
        defaultProps={defaultProps as unknown as Record<string, unknown>}
      />
    </>
  )
}

registerRoot(RemotionRoot)
