import React from 'react'
import { ReciterBadge } from '../ReciterBadge'
import { SlideSequence } from '../SlideSequence'
import { SurahTitle } from '../SurahTitle'
import { SceneBackground } from '../scene/SceneBackground'
import type { StyleProps } from './types'

export const VisualizerStyle: React.FC<StyleProps> = ({ sequences, settings, sizes, isBengali, width, height, titles }) => (
  <>
    <SceneBackground settings={settings} width={width} height={height} />
    <SurahTitle
      arabicName={titles.surahNameArabic}
      englishName={titles.surahName}
      meaning={titles.surahMeaning}
      accent={settings.highlightColor}
      text={settings.fontColor}
    />
    <ReciterBadge name={titles.reciterName} accent={settings.highlightColor} text={settings.fontColor} />
    {sequences.map((timing) => (
      <SlideSequence key={timing.index} timing={timing} settings={settings} sizes={sizes} isBengali={isBengali} width={width} height={height} />
    ))}
  </>
)
