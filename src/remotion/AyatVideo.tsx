import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import type { AyatVideoProps } from './types'
import { buildSlideSequences, computeTextSizes, isBengaliText } from './layout'
import { ReciterBadge } from './ReciterBadge'
import { SlideSequence } from './SlideSequence'
import { SurahTitle } from './SurahTitle'
import { Watermark } from './Watermark'
import { SceneBackground } from './scene/SceneBackground'
import { ensureRemotionFonts } from './loadFonts'

export const AyatVideo: React.FC<AyatVideoProps> = ({ slides, settings, isExport, ...text }) => {
  const { width, height, fps } = useVideoConfig()
  if (isExport) ensureRemotionFonts()

  const sizes = computeTextSizes(settings, width, height)
  const isBengali = isBengaliText(slides[0]?.translation ?? '')
  const sequences = React.useMemo(() => buildSlideSequences(slides, fps), [slides, fps])
  const accent = settings.highlightColor

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d', overflow: 'hidden' }}>
      <SceneBackground settings={settings} width={width} height={height} />
      <SurahTitle
        arabicName={text.surahNameArabic}
        englishName={text.surahName}
        meaning={text.surahMeaning}
        accent={accent}
        text={settings.fontColor}
      />
      <ReciterBadge name={text.reciterName} accent={accent} text={settings.fontColor} />
      {sequences.map((timing) => (
        <SlideSequence
          key={timing.index}
          timing={timing}
          settings={settings}
          sizes={sizes}
          isBengali={isBengali}
          width={width}
          height={height}
        />
      ))}
      <Watermark width={width} height={height} />
    </AbsoluteFill>
  )
}
