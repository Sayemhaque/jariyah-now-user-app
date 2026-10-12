import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import type { AyatVideoProps } from './types'
import { buildSlideSequences, computeTextSizes, isBengaliText } from './layout'
import { Background } from './Background'
import { AmbientLights } from './AmbientLights'
import { OverlayLayer } from './OverlayLayer'
import { SlideSequence } from './SlideSequence'
import { ensureRemotionFonts } from './loadFonts'

const edgeShade =
  'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.30) 100%)'

export const AyatVideo: React.FC<AyatVideoProps> = ({ slides, settings, isExport, preLooped, ...text }) => {
  const { width, height, fps } = useVideoConfig()
  if (isExport) ensureRemotionFonts()

  const sizes = computeTextSizes(settings, width, height)
  const isBengali = isBengaliText(slides[0]?.translation ?? '')
  const sequences = React.useMemo(() => buildSlideSequences(slides, fps), [slides, fps])

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a14', overflow: 'hidden' }}>
      <Background url={settings.backgroundImage} isExport={isExport} preLooped={preLooped} />
      <OverlayLayer
        style={settings.overlayStyle}
        color={settings.overlayColor}
        opacity={settings.overlayOpacity}
        width={width}
        height={height}
      />
      <div style={{ position: 'absolute', inset: 0, background: edgeShade, pointerEvents: 'none' }} />
      <AmbientLights color={settings.highlightColor} />
      {sequences.map((timing) => (
        <SlideSequence
          key={timing.index}
          timing={timing}
          settings={settings}
          sizes={sizes}
          isBengali={isBengali}
          width={width}
          height={height}
          surahName={text.surahName}
          surahNameArabic={text.surahNameArabic}
          totalAyats={text.totalAyats}
          reciterName={text.reciterName}
          attributionLine={text.attributionLine}
        />
      ))}
    </AbsoluteFill>
  )
}
