import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import type { AyatVideoProps } from './types'
import { buildSlideSequences, computeTextSizes, isBengaliText } from './layout'
import { Watermark } from './Watermark'
import { ensureRemotionFonts } from './loadFonts'
import { VideoStyleView } from './styles/VideoStyleView'

export const AyatVideo: React.FC<AyatVideoProps> = ({ slides, settings, isExport, ...text }) => {
  const { width, height, fps } = useVideoConfig()
  if (isExport) ensureRemotionFonts()

  const sizes = computeTextSizes(settings, width, height)
  const isBengali = isBengaliText(slides[0]?.translation ?? '')
  const sequences = React.useMemo(() => buildSlideSequences(slides, fps), [slides, fps])
  const titles = { surahName: text.surahName, surahNameArabic: text.surahNameArabic, surahMeaning: text.surahMeaning, reciterName: text.reciterName }

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d', overflow: 'hidden' }}>
      <VideoStyleView videoStyle={settings.videoStyle} sequences={sequences} settings={settings} sizes={sizes} isBengali={isBengali} width={width} height={height} titles={titles} />
      <Watermark width={width} height={height} />
    </AbsoluteFill>
  )
}
