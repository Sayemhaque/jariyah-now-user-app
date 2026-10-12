import { getAdvanceAtMs } from '@/lib/advanceTiming'
import type { AyatSlide, VideoSettings } from '@/lib/types'
import { orientationFontBase } from './types'

export interface SlideSequence {
  slide: AyatSlide
  index: number
  durationInFrames: number
  from: number
}

export function buildSlideSequences(slides: AyatSlide[], fps: number): SlideSequence[] {
  let from = 0
  return slides.map((slide, index) => {
    const durationInFrames = Math.round((getAdvanceAtMs(slide, slide.audioDurationMs) / 1000) * fps)
    const sequence = { slide, index, durationInFrames, from }
    from += durationInFrames
    return sequence
  })
}

export function computeTextSizes(settings: VideoSettings, width: number, height: number) {
  const base = orientationFontBase[settings.orientation]!
  const minDim = Math.min(width, height)
  return {
    minDim,
    arabic: ((base.ar * settings.arabicFontSize) / base.arRef) * (width / 100),
    translation: ((base.tr * settings.translationFontSize) / base.trRef) * (width / 100),
    transliteration: Math.max(11, minDim * 0.024),
  }
}

export const isBengaliText = (text: string) => /[ঀ-৿]/.test(text)
