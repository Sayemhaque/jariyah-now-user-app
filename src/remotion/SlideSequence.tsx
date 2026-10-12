import React from 'react'
import { Audio, Sequence } from 'remotion'
import type { VideoSettings } from '@/lib/types'
import type { computeTextSizes, SlideSequence as SlideTiming } from './layout'
import { Attribution } from './Attribution'
import { SlideCard } from './SlideCard'
import { TopHeader } from './TopHeader'
import { Watermark } from './Watermark'

interface SlideSequenceProps {
  timing: SlideTiming
  settings: VideoSettings
  sizes: ReturnType<typeof computeTextSizes>
  isBengali: boolean
  width: number
  height: number
  surahName: string
  surahNameArabic: string
  totalAyats: number
  reciterName: string
  attributionLine: string
}

export const SlideSequence: React.FC<SlideSequenceProps> = ({ timing, width, height, ...props }) => {
  const { slide, index } = timing
  return (
    <Sequence from={timing.from} durationInFrames={timing.durationInFrames}>
      <Audio src={slide.audioUrl} />
      <TopHeader
        surahName={props.surahName}
        surahNameArabic={props.surahNameArabic}
        ayatNumber={slide.ayatNumber}
        surahNumber={slide.surahNumber}
        index={index}
        total={props.totalAyats}
        width={width}
        height={height}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `0 ${(8 * width) / 100}px`,
        }}
      >
        <SlideCard slide={slide} settings={props.settings} sizes={props.sizes} width={width} isBengali={props.isBengali} />
      </div>
      <Attribution reciterName={props.reciterName} attributionLine={props.attributionLine} width={width} height={height} />
      <Watermark width={width} height={height} />
    </Sequence>
  )
}
